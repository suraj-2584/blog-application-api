const mongoose=require('mongoose');

const BlogSchema = new mongoose.Schema({
    title:{
        type:String,
    },
    summary: String,
    description:String,
    imageUrl:String,
    author:String,

},{
    timestamps:true,
});

const BlogModel = mongoose.model('Blog',BlogSchema);
module.exports = BlogModel;