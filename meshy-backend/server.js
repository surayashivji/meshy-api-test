const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.post('/api/meshy/create', async (req, res) => {
  try {
    console.log('📝 Full request parameters:');
    console.log('- enable_pbr:', req.body.enable_pbr);
    console.log('- topology:', req.body.topology);
    console.log('- target_polycount:', req.body.target_polycount);
    console.log('- image_url length:', req.body.image_url?.length || 'undefined');
    console.log('🔑 Auth header:', req.headers.authorization ? 'Present' : 'Missing');
    
    const response = await fetch('https://api.meshy.ai/v1/image-to-3d', {
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    console.log('🌐 Meshy response status:', response.status);
    const data = await response.json();
    console.log('📨 Full Meshy response:', JSON.stringify(data, null, 2));
    
    res.json(data);
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/meshy/status/:id', async (req, res) => {
  try {
    console.log(`🔍 Checking status for: ${req.params.id}`);
    const response = await fetch(`https://api.meshy.ai/v1/image-to-3d/${req.params.id}`, {
      headers: { 'Authorization': req.headers.authorization }
    });
    const data = await response.json();
    console.log(`📊 Status: ${data.status}`);
    
    if (data.status === 'SUCCEEDED') {
      console.log('🎯 SUCCESS! Full response:');
      console.log('- GLB URL:', data.model_urls?.glb);
      console.log('- FBX URL:', data.model_urls?.fbx); 
      console.log('- USDZ URL:', data.model_urls?.usdz);
      console.log('- Texture URLs:', data.texture_urls);
      console.log('- Full model data:', JSON.stringify(data, null, 2));
      console.log(JSON.stringify(data, null, 2)); // This shows EVERYTHING
    }
    
    res.json(data);
  } catch (error) {
    console.error('❌ Status error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));