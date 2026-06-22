const express = require("express");

const app = express();


// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const response = await fetch("http://backend:4000/api/products");
    const data = await response.json();

    res.json(data);

  } catch (error) {
    res.status(500).json({
      success:false,
      message:"Gateway error",
      error:error.message
    });
  }
});


// Get single product
app.get("/api/products/:id", async (req, res) => {
  try {
    const response = await fetch(
      `http://backend:4000/api/products/${req.params.id}`
    );

    const data = await response.json();

    res.json(data);

  } catch (error) {
    res.status(500).json({
      success:false,
      message:"Gateway error",
      error:error.message
    });
  }
});


// Denied API
app.delete("/api/products/:id", (req,res)=>{
  res.status(403).json({
    success:false,
    message:"Permission denied"
  });
});


app.listen(3000,()=>{
  console.log("API Gateway running on port 3000");
});