from flask import Flask, jsonify, request, redirect
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os
import uuid
import json
from werkzeug.utils import secure_filename
import io
from werkzeug.middleware.proxy_fix import ProxyFix
from dotenv import load_dotenv
from sqlalchemy import inspect, text
import boto3
from functools import lru_cache
from flask_migrate import Migrate

# -------------------------------------------------
# App setup
# -------------------------------------------------
load_dotenv()

# Support both legacy (WASABI_KEY/WASABI_SECRET) and AWS-style
# (WASABI_ACCESS_KEY_ID/WASABI_SECRET_ACCESS_KEY) environment variable names
# so deployments that already use the AWS naming convention continue to work.
WASABI_KEY = os.getenv("WASABI_KEY") or os.getenv("WASABI_ACCESS_KEY_ID")
WASABI_SECRET = os.getenv("WASABI_SECRET") or os.getenv("WASABI_SECRET_ACCESS_KEY")
WASABI_BUCKET = os.getenv("WASABI_BUCKET")
WASABI_REGION = os.getenv("WASABI_REGION", "eu-central-1")
_endpoint = os.getenv("WASABI_ENDPOINT")
if _endpoint:
    if _endpoint.startswith("http://"):
        _endpoint = "https://" + _endpoint[len("http://"):]
    elif not _endpoint.startswith("https://"):
        _endpoint = f"https://{_endpoint}"
    WASABI_ENDPOINT = _endpoint.rstrip("/")
else:
    WASABI_ENDPOINT = f"https://s3.{WASABI_REGION}.wasabisys.com"


def _require(*pairs):
    missing = [k for k, v in pairs if not v]
    if missing:
        raise RuntimeError(f"Missing Wasabi config: {', '.join(missing)}")


@lru_cache
def get_s3():
    _require(
        ("WASABI_KEY or WASABI_ACCESS_KEY_ID", WASABI_KEY),
        ("WASABI_SECRET or WASABI_SECRET_ACCESS_KEY", WASABI_SECRET),
        ("WASABI_BUCKET", WASABI_BUCKET),
    )
    return boto3.client(
        "s3",
        endpoint_url=WASABI_ENDPOINT,
        aws_access_key_id=WASABI_KEY,
        aws_secret_access_key=WASABI_SECRET,
        region_name=WASABI_REGION,
    )


BUCKET = WASABI_BUCKET

app = Flask(__name__)

# CORS: allow your frontend origins (prod + local dev)
CORS(app, resources={
    r"/api/*": {
        "origins": [
            "https://posterscoop.studio",
            "https://www.posterscoop.studio",
            "http://localhost:3000",
            "http://localhost:3004",

            "https://posterscoop-frontend.fly.dev"
        ],
        "supports_credentials": True
    }
})

# Redirect HTTP requests to HTTPS in production to avoid mixed-content issues
@app.before_request
def enforce_https_in_production():
    proto = request.headers.get("X-Forwarded-Proto", "http")
    if proto != "https" and not request.host.startswith(("localhost", "127.0.0.1")):
        url = request.url.replace("http://", "https://", 1)
        return redirect(url, code=301)

# -------------------------------------------------
# Paths & DB config
# -------------------------------------------------
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)


def save_file(file_storage, prefix="designs") -> str:
    filename = secure_filename(file_storage.filename or "upload")
    ext = (filename.rsplit(".", 1)[-1] or "jpg").lower()
    key = f"{prefix}/{uuid.uuid4().hex}.{ext}"
    s3 = get_s3()
    s3.upload_fileobj(
        file_storage.stream,
        BUCKET,
        key,
        ExtraArgs={
            "ContentType": file_storage.mimetype or "image/jpeg",
        },
    )
    return key

raw_url = os.environ.get("DATABASE_URL")
if raw_url and raw_url.startswith("postgres://"):
    raw_url = raw_url.replace("postgres://", "postgresql://", 1)

db_path = os.path.join(BASE_DIR, "app.db")
app.config["SQLALCHEMY_DATABASE_URI"] = raw_url or f"sqlite:///{db_path}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# -------------------------------------------------
# Models
# -------------------------------------------------
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)   # <- was String(128)
    role = db.Column(db.String(20), nullable=False, default="customer")
    name = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)


MAIN_CATEGORIES = [
    "Movies",
    "TV Series",
    "Anime",
    "Games",
    "Music",
    "Quotes",
    "Art & Aesthetic",
    "Sports",
    "Bangladeshi Culture",
    "Nature & Landscapes",
    "Motivational",
    "Minimalist",
    "Typography",
    "Sci-Fi & Fantasy",
    "Comics",
    "Cartoons",
    "Abstract",
    "Space & Galaxy",
    "City & Architecture",
    "Vintage / Retro",
]


class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    main_category = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Design(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    title = db.Column(db.String(100))
    image_filename = db.Column(db.String(200))
    poster_type = db.Column(db.String(50))
    size = db.Column(db.String(50))
    thickness = db.Column(db.String(50))
    featured = db.Column(db.Boolean, default=False)
    hidden = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    category = db.relationship("Category")


class ProductPerformance(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    design_id = db.Column(
        db.Integer, db.ForeignKey("design.id"), unique=True, nullable=False
    )
    count = db.Column(db.Integer, default=0)

    design = db.relationship("Design")


class CustomOrder(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    order_code = db.Column(db.String(40), unique=True, nullable=False)
    poster_type = db.Column(db.String(50))
    size = db.Column(db.String(50))
    thickness = db.Column(db.String(50))
    file_path = db.Column(db.String(200))
    status = db.Column(db.String(50), default="pending")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User")


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_code = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20), nullable=False)
    address = db.Column(db.String(200), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    postal_code = db.Column(db.String(20))
    payment_method = db.Column(db.String(50), default="cod")
    status = db.Column(db.String(20), default="pending")
    items = db.Column(db.Text, nullable=False)
    total_price = db.Column(db.Float, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# New models for globally accessible discounts

class PosterDiscount(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    poster_type = db.Column(db.String(50), nullable=False)
    size = db.Column(db.String(50), nullable=False)
    percent = db.Column(db.Float, default=0)
    amount = db.Column(db.Float, default=0)


class PromoCode(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(50), unique=True, nullable=False)
    percent = db.Column(db.Float, default=0)
    amount = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -------------------------------------------------
# Admin seed
# -------------------------------------------------
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@example.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "adminpass")

def init_db():
    """Create tables and seed the admin user; attempt to patch older DBs."""
    db.create_all()
    inspector = inspect(db.engine)

    # Patch old 'order' table if it exists and lacks columns
    if "order" in inspector.get_table_names():
        order_columns = [col["name"] for col in inspector.get_columns("order")]
        if "status" not in order_columns:
            with db.engine.begin() as conn:
                conn.execute(
                    text('ALTER TABLE "order" ADD COLUMN status VARCHAR(20) DEFAULT \'pending\'')
                )
        if "order_code" not in order_columns:
            with db.engine.begin() as conn:
                conn.execute(text('ALTER TABLE "order" ADD COLUMN order_code VARCHAR(20)'))

    # Patch old 'user' table if it exists and lacks columns
    if "user" in inspector.get_table_names():
        user_columns = [col["name"] for col in inspector.get_columns("user")]
        if "name" not in user_columns:
            with db.engine.begin() as conn:
                conn.execute(text('ALTER TABLE "user" ADD COLUMN name VARCHAR(100)'))
        if "phone" not in user_columns:
            with db.engine.begin() as conn:
                conn.execute(text('ALTER TABLE "user" ADD COLUMN phone VARCHAR(20)'))
        if "address" not in user_columns:
            with db.engine.begin() as conn:
                conn.execute(text('ALTER TABLE "user" ADD COLUMN address VARCHAR(200)'))

    # Seed admin
    if not User.query.filter_by(email=ADMIN_EMAIL).first():
        admin = User(
            email=ADMIN_EMAIL,
            password_hash=generate_password_hash(ADMIN_PASSWORD),
            role="admin",
        )
        db.session.add(admin)
        db.session.commit()

# -------------------------------------------------
# Helpers
# -------------------------------------------------
def generate_order_code():
    """Generate a human-friendly order code like '250001'."""
    year_prefix = datetime.utcnow().strftime("%y")
    last = (
        Order.query.filter(Order.order_code.like(f"{year_prefix}%"))
        .order_by(Order.order_code.desc())
        .first()
    )
    if last:
        seq = int(last.order_code[2:]) + 1
    else:
        seq = 1
    return f"{year_prefix}{seq:04d}"

# -------------------------------------------------
# Routes
# -------------------------------------------------
@app.route("/health")
def health():
    return {"status": "ok"}, 200


@app.route("/api/image/<path:key>")
def get_image(key):
    """Return a presigned URL for an object stored in Wasabi."""
    s3 = get_s3()
    url = s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": BUCKET, "Key": key},
        ExpiresIn=3600,
    )
    return jsonify({"url": url})


def serialize_design(design):
    return {
        "id": design.id,
        "title": design.title,
        "imageKey": design.image_filename,
        "categoryId": design.category_id,
        "posterType": design.poster_type,
        "size": design.size,
        "thickness": design.thickness,
        "featured": design.featured,
        "hidden": design.hidden,
    }


def serialize_poster_discount(discount):
    return {
        "id": discount.id,
        "posterType": discount.poster_type,
        "size": discount.size,
        "percent": discount.percent,
        "amount": discount.amount,
    }


def serialize_promo_code(code):
    return {
        "id": code.id,
        "code": code.code,
        "percent": code.percent,
        "amount": code.amount,
    }


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    missing = []
    if not email:
        missing.append("email")
    if not password:
        missing.append("password")
    if missing:
        return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400
    if User.query.filter_by(email=email).first():
        return jsonify(error="Email already registered"), 400

    user = User(
        email=email, password_hash=generate_password_hash(password), role="customer"
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(message="Registered"), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")
    missing = []
    if not email:
        missing.append("email")
    if not password:
        missing.append("password")
    if missing:
        return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400

    user = User.query.filter_by(email=email).first()
    if user and user.check_password(password):
        return jsonify(role=user.role)
    return jsonify(error="Invalid credentials"), 401


@app.route("/api/user", methods=["GET", "PATCH"])
def user_account():
    if request.method == "GET":
        email = request.args.get("email")
        if not email:
            return jsonify(error="Email required"), 400
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify(error="User not found"), 404
        return jsonify(
            email=user.email,
            name=user.name,
            phone=user.phone,
            address=user.address,
            created_at=user.created_at.isoformat(),
        )

    data = request.get_json() or {}
    email = data.get("email")
    if not email:
        return jsonify(error="Email required"), 400
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify(error="User not found"), 404

    for field in ["name", "phone", "address"]:
        if field in data:
            setattr(user, field, data.get(field))

    new_password = data.get("new_password")
    if new_password:
        password = data.get("password")
        if not password or not user.check_password(password):
            return jsonify(error="Invalid password"), 400
        user.password_hash = generate_password_hash(new_password)

    db.session.commit()
    return jsonify(
        message="Account updated",
        email=user.email,
        name=user.name,
        phone=user.phone,
        address=user.address,
    )


@app.route("/api/categories", methods=["GET", "POST"])
def categories():
    if request.method == "POST":
        data = request.get_json() or {}
        name = data.get("name")
        main_category = data.get("main_category")
        missing = []
        if not name:
            missing.append("name")
        if not main_category or main_category not in MAIN_CATEGORIES:
            missing.append("main_category")
        if missing:
            return jsonify(error=f"Missing or invalid fields: {', '.join(missing)}"), 400
        category = Category(name=name, main_category=main_category)
        db.session.add(category)
        db.session.commit()
        return (
            jsonify(
                id=category.id,
                name=category.name,
                main_category=category.main_category,
            ),
            201,
        )

    cats = Category.query.all()
    return jsonify(
        [
            {
                "id": c.id,
                "name": c.name,
                "main_category": c.main_category,
            }
            for c in cats
        ]
    )


@app.route("/api/categories/<int:cat_id>", methods=["PUT", "DELETE"])
def category_detail(cat_id):
    category = Category.query.get_or_404(cat_id)
    if request.method == "PUT":
        data = request.get_json() or {}
        if "main_category" in data:
            if data["main_category"] not in MAIN_CATEGORIES:
                return jsonify(error="Invalid main_category"), 400
            category.main_category = data["main_category"]
        if "name" in data:
            category.name = data["name"]
        db.session.commit()
        return jsonify(
            id=category.id,
            name=category.name,
            main_category=category.main_category,
        )

    db.session.delete(category)
    db.session.commit()
    return jsonify(message="Deleted")


@app.route("/api/designs", methods=["GET", "POST"])
def designs():
    if request.method == "POST":
        form = request.form
        image = request.files.get("image")
        category_id = form.get("category_id")
        title = form.get("title")
        poster_type = form.get("poster_type")
        size = form.get("size")
        thickness = form.get("thickness")
        featured = form.get("featured", "false").lower() == "true"
        hidden = form.get("hidden", "false").lower() == "true"

        missing = []
        if not category_id:
            missing.append("category_id")
        if not image:
            missing.append("image")
        if missing:
            return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400

        if title and Design.query.filter_by(title=title).first():
            return jsonify(error="Title already exists"), 400

        key = save_file(image)

        design = Design(
            category_id=int(category_id),
            title=title,
            image_filename=key,
            poster_type=poster_type,
            size=size,
            thickness=thickness,
            featured=featured,
            hidden=hidden,
        )
        db.session.add(design)
        db.session.commit()
        return jsonify(serialize_design(design)), 201

    query = Design.query
    category_id = request.args.get("category_id")
    if category_id:
        query = query.filter_by(category_id=category_id)
    main_category = request.args.get("main_category")
    if main_category:
        query = query.join(Category).filter(Category.main_category == main_category)
    featured = request.args.get("featured")
    if featured is not None:
        query = query.filter_by(featured=featured.lower() == "true")
    hidden = request.args.get("hidden")
    if hidden is not None:
        query = query.filter_by(hidden=hidden.lower() == "true")
    search = request.args.get("search")
    if search:
        query = query.filter(Design.title.ilike(f"%{search}%"))

    designs_list = query.all()
    if search and not designs_list:
        return jsonify(error="No item found with that name"), 404
    return jsonify([serialize_design(d) for d in designs_list])


@app.route("/api/designs/<int:design_id>", methods=["GET", "PUT", "DELETE"])
def design_detail(design_id):
    design = Design.query.get_or_404(design_id)
    if request.method == "GET":
        return jsonify(serialize_design(design))
    if request.method == "PUT":
        data = request.get_json() or {}
        for field in [
            "category_id",
            "title",
            "image_filename",
            "poster_type",
            "size",
            "thickness",
            "featured",
            "hidden",
        ]:
            if field in data:
                value = data[field]
                if field == "image_filename" and value:
                    # If a full URL was provided, keep only the object key
                    value = value.split("/api/image/", 1)[-1]
                    value = value.split("/uploads/", 1)[-1]
                    if BUCKET and f"/{BUCKET}/" in value:
                        value = value.split(f"/{BUCKET}/", 1)[1]
                    value = value.lstrip("/")
                setattr(design, field, value)
        db.session.commit()
        return jsonify(id=design.id)

    # Remove associated image from Wasabi before deleting record
    try:
        get_s3().delete_object(Bucket=BUCKET, Key=design.image_filename)
    except Exception:
        pass
    # Delete any related ProductPerformance stats to avoid FK constraint errors
    stat = ProductPerformance.query.filter_by(design_id=design.id).first()
    if stat:
        db.session.delete(stat)

    db.session.delete(design)
    db.session.commit()
    return jsonify(message="Deleted")


@app.route("/api/discounts/posters", methods=["GET", "POST"])
def poster_discounts():
    if request.method == "POST":
        data = request.get_json() or {}
        poster_type = data.get("poster_type") or data.get("posterType")
        size = data.get("size")
        if not poster_type or not size:
            return jsonify(error="Missing fields: poster_type,size"), 400
        discount = PosterDiscount(
            poster_type=poster_type,
            size=size,
            percent=data.get("percent", 0),
            amount=data.get("amount", 0),
        )
        db.session.add(discount)
        db.session.commit()
        return jsonify(serialize_poster_discount(discount)), 201

    discounts = PosterDiscount.query.all()
    return jsonify([serialize_poster_discount(d) for d in discounts])


@app.route("/api/discounts/posters/<int:discount_id>", methods=["DELETE"])
def poster_discount_detail(discount_id):
    discount = PosterDiscount.query.get_or_404(discount_id)
    db.session.delete(discount)
    db.session.commit()
    return jsonify(message="Deleted")


@app.route("/api/discounts/promo", methods=["GET", "POST"])
def promo_codes():
    if request.method == "POST":
        data = request.get_json() or {}
        code = data.get("code")
        if not code:
            return jsonify(error="Missing code"), 400
        if PromoCode.query.filter_by(code=code).first():
            return jsonify(error="Code already exists"), 400
        promo = PromoCode(
            code=code,
            percent=data.get("percent", 0),
            amount=data.get("amount", 0),
        )
        db.session.add(promo)
        db.session.commit()
        return jsonify(serialize_promo_code(promo)), 201

    promos = PromoCode.query.all()
    return jsonify([serialize_promo_code(p) for p in promos])


@app.route("/api/discounts/promo/<int:promo_id>", methods=["DELETE"])
def promo_code_detail(promo_id):
    promo = PromoCode.query.get_or_404(promo_id)
    db.session.delete(promo)
    db.session.commit()
    return jsonify(message="Deleted")


@app.route("/api/custom-orders", methods=["POST", "GET"])
def custom_orders():
    if request.method == "POST":
        user_id = request.form.get("user_id")
        poster_type = request.form.get("poster_type")
        size = request.form.get("size")
        thickness = request.form.get("thickness")
        upload = request.files.get("file")

        missing = []
        for field_name, value in [
            ("poster_type", poster_type),
            ("size", size),
            ("thickness", thickness),
            ("file", upload),
        ]:
            if not value:
                missing.append(field_name)
        if missing:
            return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400

        order_code = uuid.uuid4().hex[:8]
        key = save_file(upload, prefix=f"custom_orders/{order_code}")

        order = CustomOrder(
            user_id=user_id,
            order_code=order_code,
            poster_type=poster_type,
            size=size,
            thickness=thickness,
            file_path=key,
            status="submitted",
        )
        db.session.add(order)
        db.session.commit()
        return jsonify(order_code=order_code), 201

    orders = CustomOrder.query.order_by(CustomOrder.created_at.desc()).all()
    return jsonify(
        [
            {
                "id": o.id,
                "order_code": o.order_code,
                "user_id": o.user_id,
                "poster_type": o.poster_type,
                "size": o.size,
                "thickness": o.thickness,
                "file_path": o.file_path,
                "status": o.status,
            }
            for o in orders
        ]
    )


@app.route("/api/custom-orders/<string:order_code>/download")
def download_custom_order(order_code):
    """Allow admin to download the original custom design."""
    order = CustomOrder.query.filter_by(order_code=order_code).first_or_404()
    if not order.file_path:
        return jsonify(error="File not found"), 404
    s3 = get_s3()
    try:
        obj = s3.get_object(Bucket=BUCKET, Key=order.file_path)
    except Exception:
        return jsonify(error="File not found"), 404
    return send_file(
        io.BytesIO(obj["Body"].read()),
        download_name=os.path.basename(order.file_path),
        as_attachment=True,
    )


@app.route("/api/custom-orders/<string:order_code>", methods=["DELETE"])
def delete_custom_order(order_code):
    """Delete the custom design and its record, and remove references in orders."""
    custom_order = CustomOrder.query.filter_by(order_code=order_code).first_or_404()
    if custom_order.file_path:
        try:
            get_s3().delete_object(Bucket=BUCKET, Key=custom_order.file_path)
        except Exception:
            pass

    related_orders = Order.query.filter(Order.items.contains(order_code)).all()
    for ord_ in related_orders:
        items = json.loads(ord_.items or "[]")
        changed = False
        for item in items:
            if item.get("orderCode") == order_code:
                item.pop("orderCode", None)
                changed = True
        if changed:
            ord_.items = json.dumps(items)

    db.session.delete(custom_order)
    db.session.commit()
    return jsonify(message="Deleted")


@app.route("/api/orders", methods=["POST", "GET"])
def orders():
    if request.method == "POST":
        data = request.get_json() or {}

        # required presence (total_price can be 0, so only check presence)
        presence_missing = [f for f in ["items", "total_price"] if f not in data]

        # required non-empty fields
        empties = [f for f in ["name", "phone", "address", "city"] if not data.get(f)]

        missing = presence_missing + empties
        if missing:
            return jsonify(error=f"Missing fields: {', '.join(missing)}"), 400

        code = generate_order_code()
        order = Order(
            order_code=code,
            name=data.get("name"),
            email=data.get("email"),
            phone=data.get("phone"),
            address=data.get("address"),
            city=data.get("city"),
            postal_code=data.get("postal_code"),
            payment_method=data.get("payment_method", "cod"),
            items=json.dumps(data.get("items")),
            total_price=data.get("total_price", 0),
        )
        db.session.add(order)
        db.session.commit()
        return jsonify(message="Order placed", order_id=f"#{code}"), 201

    email = request.args.get("email")
    query = Order.query.order_by(Order.created_at.desc())
    if email:
        query = query.filter_by(email=email)
    orders_list = query.all()
    response = []
    for o in orders_list:
        items = json.loads(o.items or "[]")
        if email:
            # hide internal orderCode markers for customer view
            for item in items:
                item.pop("orderCode", None)
        response.append(
            {
                "id": o.id,
                "order_code": o.order_code,
                "name": o.name,
                "email": o.email,
                "phone": o.phone,
                "address": o.address,
                "city": o.city,
                "postal_code": o.postal_code,
                "payment_method": o.payment_method,
                "status": o.status,
                "items": items,
                "total_price": o.total_price,
                "created_at": o.created_at.isoformat(),
            }
        )
    return jsonify(response)


@app.route("/api/orders/<int:order_id>", methods=["PATCH"])
def update_order(order_id):
    data = request.get_json() or {}
    status = data.get("status")
    valid_statuses = {"pending", "confirmed", "processing", "delivered", "cancelled"}
    if status not in valid_statuses:
        return jsonify(error="Invalid status"), 400
    order = Order.query.get_or_404(order_id)
    order.status = status
    db.session.commit()
    return jsonify(message="Status updated")


@app.route("/api/product-performance", methods=["GET", "POST"])
def product_performance():
    if request.method == "POST":
        data = request.get_json() or {}
        design_id = data.get("design_id")
        if not design_id:
            return jsonify(error="design_id required"), 400
        stat = ProductPerformance.query.filter_by(design_id=design_id).first()
        if stat:
            stat.count += 1
        else:
            stat = ProductPerformance(design_id=design_id, count=1)
            db.session.add(stat)
        db.session.commit()
        return jsonify(message="Recorded"), 201

    stats = ProductPerformance.query.join(Design).all()
    return jsonify(
        [
            {"design_id": s.design_id, "title": s.design.title if s.design else None, "count": s.count}
            for s in stats
        ]
    )


@app.route("/api/bestsellers")
def bestsellers():
    designs = Design.query.filter_by(featured=True, hidden=False).all()
    return jsonify([serialize_design(d) for d in designs])


@app.route("/api/hello")
def hello():
    return jsonify(message="Hello from Flask!")


# -------------------------------------------------
# Main
# -------------------------------------------------
if __name__ == "__main__":
    with app.app_context():
        init_db()
    # Use port 5004 locally; on Fly, Gunicorn in Dockerfile serves on 8080
    app.run(debug=True, port=5004)
