// import {
//     asd
// } from './func'
import './materialize.min'

// $(function() {
// const tett = 10;
// console.log('tett :>> ', tett);
// $('body').hide();
// $(this).on('click', function () {
// 	$('body').css({
// 		backgroundColor: 'red',
// 		color: 'white'
// 	}).show()
// });


//     asd();

// })
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('.collapsible');
    var instances = M.Collapsible.init(elems, {
        accordion: false
    });
    instances.open();
});