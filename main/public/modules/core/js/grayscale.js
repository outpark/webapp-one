/*!
 * Dental Hackathon - Designed with love by Saj Arora
 */

$(window).scroll(function() {
    if (!$(".navbar").hasClass("fancy"))
        return;
    if ($(".navbar.fancy").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});

$(document).on('ready', function(){
    // jQuery to collapse the navbar on scroll
    $('.navbar').on('click', function(){
        console.log('hre');
    })

    $('.navbar-collapse ul li a').click(function() {
        console.log('test');
        $('.navbar-toggle:visible').click();
    });
});
