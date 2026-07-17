const mongoose = require('mongoose');


 //create schema
const brandSchema = new mongoose.Schema({
    name:{
        type : String,
         unique: true,
        
    },
    slug:{
        type:String,
        lowercase:true,
    },
    image:String,
},{timestamps:true})
brandSchema.statics.searchFields = [
  "name",
];
const setImageUrl = (doc) => {
  if (doc.image) {
    const imageUrl = `${process.env.BASE_URL}/brand/${doc.image}`;
    doc.image = imageUrl;
  }
};
brandSchema.post("init", (doc) => {
  setImageUrl(doc);
});
brandSchema.post("save", (doc) => {
  setImageUrl(doc);
});
//convert schema to model to use
const BrandModel = mongoose.model('Brand',brandSchema) 



module.exports =BrandModel