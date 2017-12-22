jQuery(document).ready(function() {
  jQuery('pre').each(function(i, block) {
    var jqBlock = jQuery(block);
    var language = jqBlock.attr('lang');
    if (language) {
      jqBlock.addClass('language-' + language);
    }
    hljs.highlightBlock(block);
  });
});
