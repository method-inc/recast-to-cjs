/** Top level comments shouldn’t be duplicated. */
define(function() {
  return 'hello world';
});

define({
  hello: 'world'
});

require(['alphabet', 'novar'], function(soup) {
  window.init();
  return soup.eatWith('spoon');
});
