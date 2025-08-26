import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { MAIN_CATEGORIES } from '../utils/categories';
import '../App.css';

function AdminUpload() {
  const { user } = useAuth();
  const { categories, uploadDesigns } = useAdmin();
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadMain, setUploadMain] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [previews, setPreviews] = useState([]);
  const [fileNames, setFileNames] = useState([]);
  const [status, setStatus] = useState(null);
  const [progress, setProgress] = useState(0);

  if (!user || !user.isAdmin) return <Navigate to="/login" replace />;

  const handleUploadChange = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
    setFileNames(files.map(() => ''));
  };

  const handleNameChange = (idx, value) => {
    setFileNames((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    if (!uploadCategory || uploadFiles.length === 0) return;
    const cat = categories.find((c) => c.id === uploadCategory);
    if (!cat) return;
    try {
      await uploadDesigns(
        uploadFiles,
        cat.id,
        cat.name,
        cat.main_category,
        uploadName.trim() || undefined,
        setProgress,
        fileNames,
      );
      setStatus({ type: 'success', message: 'Upload successful!' });
      setUploadFiles([]);
      setPreviews([]);
      setFileNames([]);
      setUploadName('');
      setProgress(0);
    } catch {
      setStatus({ type: 'error', message: 'Upload failed.' });
      setProgress(0);
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bulk Upload
      </Typography>
      <Box component="form" onSubmit={submitUpload} className="upload-form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Select
          value={uploadMain}
          onChange={(e) => {
            setUploadMain(e.target.value);
            setUploadCategory('');
          }}
          displayEmpty
          size="small"
        >
          <MenuItem value="">
            <em>Select Category</em>
          </MenuItem>
          {MAIN_CATEGORIES.map((cat) => (
            <MenuItem key={cat} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </Select>
        <Select
          value={uploadCategory}
          onChange={(e) => setUploadCategory(Number(e.target.value))}
          displayEmpty
          size="small"
          disabled={!uploadMain}
        >
          <MenuItem value="">
            <em>Select Sub Category</em>
          </MenuItem>
          {categories
            .filter((c) => c.main_category === uploadMain)
            .map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
        </Select>
        <TextField
          value={uploadName}
          onChange={(e) => setUploadName(e.target.value)}
          placeholder="Filename base"
          size="small"
        />
        <Button variant="outlined" component="label">
          Choose Files
          <input type="file" hidden multiple onChange={handleUploadChange} />
        </Button>
        {previews.length > 0 && (
          <Box className="preview-list">
            {previews.map((src, idx) => (
              <Box key={`${uploadFiles[idx].name}-${idx}`} className="preview-item">
                <TextField
                  value={fileNames[idx] || ''}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  placeholder="Custom name"
                  size="small"
                />
                <Typography className="preview-filename">{uploadFiles[idx].name}</Typography>
                <img src={src} alt="preview" className="preview-thumb" />
              </Box>
            ))}
          </Box>
        )}
        {progress > 0 && <LinearProgress variant="determinate" value={progress} />}
        <Button type="submit" variant="contained">
          Upload
        </Button>
      </Box>
      {status && <p className={status.type === 'error' ? 'error' : 'success'}>{status.message}</p>}
    </Container>
  );
}

export default AdminUpload;
