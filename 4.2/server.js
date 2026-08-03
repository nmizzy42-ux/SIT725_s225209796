var express = require("express")
var app = express()
var port = process.env.port || 3004

const mongoose = require('mongoose');

app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb://127.0.0.1:27017/myprojectDB');

const ProjectSchema = new mongoose.Schema({
    title: String,
    image: String,
    link: String,
    description: String,
});

const Project = mongoose.model('Project', ProjectSchema);

const sampleProject = new Project({
    title: "Harry Potter and the Philosopher's Stone",
    image: "images/book4.jpg",
    link: "Blurb",
    description: "On his eleventh birthday, an unhappy boy named Harry Potter discovers he is a wizard."
});

sampleProject.save()
    .then(() => console.log("Sample project saved!"));

app.get('/api/projects', async (req, res) => {
    const projects = await Project.find({});

    res.json({ statusCode: 200, data: projects, message: 'Success' });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});