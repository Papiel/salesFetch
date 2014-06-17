'use strict';

var data = window.data;

/**
 * Filtering
 */
$("#filter").popover({
  placement : 'bottom',
  html: true,
  container: '.navbar-result',
  content : $('#filter-template').html()
});

$('#filter').on('hidden.bs.popover', function () {
  $('body').unbind('click');
});

$('#filter').on('shown.bs.popover', function () {
  $('body').bind('click', function(e) {
    if ($(e.target).data('toggle') !== 'popover' && $(e.target).parents('.popover.in').length === 0) {
      $('#filter').popover('hide');
    }
  });
});

$("#left-panel").on('click', '.dismiss', function(e) {
  e.preventDefault();
  $('#filter').popover('hide');
});

$("#left-panel").on('click', '.execute', function(e) {
  e.preventDefault();
  var filters = {};

  var token = $('#provider').val();
  if (token.length > 0) {
    filters.token = token;
  }

  var dT = $('#type').val();
  if (dT.length > 0) {
    filters.document_type = dT;
  }

  var url = '/app/context-search?filters=' + encodeURIComponent(JSON.stringify(filters));
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithDatas = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));
  window.location = urlWithDatas;
});

/**
 * Toogle left panel
 */
$('#left-toogle').click(function() {
  $("#left-panel").toggleClass('active');
});

/**
 * Hide filters
 */
 $('.snippet-list').scrollTop(50);

/**
 * Hide left bar on click snippet
 */
$('.snippet').click(function(e) {

  $('#empty-message').addClass('hidden');
  $('#full-container').html('<img id="doc-loading-indicator"  src="/img/ajax-loader.gif">');

  e.preventDefault();
  $("#left-panel").removeClass('active');
  $('#full-container .full').remove();

  var url = $(this).data("url");
  var linker = url.indexOf('?') !== -1 ? '&' : '?';
  var urlWithDatas = url + linker + "data=" + encodeURIComponent(JSON.stringify(data));

  /* Select snippet */
  $('.snippet.active').removeClass('active');
  $(this).addClass('active');

  var selectedSnippet = this;

  $.get(urlWithDatas, function(res) {
    if ($(selectedSnippet).hasClass('active')) {
      $('#full-container').html('<div class="well full">' + res + '</div>');
    };
  });

  var title = $(this).find('.title').text();
  $('#doc-title').html(title);
});
