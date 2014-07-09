
// -------------- Override Bootstrap actions

// Do not close filters menu when click inside
$('#filter-tabs .dropdown-menu a').click(function(e) {
    e.stopPropagation();
});
