const cardList = [
    {
        title: "Penguin Random House Python Crash Course",
        image: "images/book2.jpg",
        link: "Blurb",
        desciption: "Designed for beginners, this project-based guide teaches Python fundamentals through practical exercises, including creating data visualizations, a web application, and a simple game."
    },
    {
        title: "Adulting: How to Become a Grown-up in 468 Easy(ish) Steps",
        image: "images/book3.jpg",
        link: "Blurb",
        desciption: "Being a grown-up is hard. Nobody gives you a manual when you turn eighteen, and suddenly you have to buy your own toilet paper, cook real food, and talk on the phone to fix your bills."
    }
]

const clickMe = () => {
    alert("Thanks for clicking me. Hope you have a nice day!")
}
const submitForm = () => {
    let formData = {};
    formData.first_name = $('#first_name').val();
    formData.last_name = $('#last_name').val();
    formData.password = $('#password').val();
    formData.email = $('#email').val();
    console.log("Form Data Submitted: ", formData);
}
const addCards = (items) => {
    items.forEach(item => {
        let itemToAppend = '<div class="col s4 center-align">' +
            '<div class="card medium"><div class="card-image waves-effect waves-block waves-light"><img class="activator" src="' + item.image + '">' +
            '</div><div class="card-content">' +
            '<span class="card-title activator grey-text text-darken-4">' + item.title + '<i class="material-icons right">more_vert</i></span><p><a href="#">' + item.link + '</a></p></div>' +
            '<div class="card-reveal">' +
            '<span class="card-title grey-text text-darken-4">' + item.title + '<i class="material-icons right">close</i></span>' +
            '<p class="card-text">' + item.desciption + '</p>' +
            '</div></div></div>';
        $("#card-section").append(itemToAppend)
    });
}
$(document).ready(function () {
    $('.materialboxed').materialbox();
    $('#formSubmit').click(() => {
        submitForm();
    })
    addCards(cardList);
    $('.modal').modal();
});