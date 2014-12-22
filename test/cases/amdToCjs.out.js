{
  module.exports = 'hello world';
}

module.exports = {
  hello: 'world'
};

var soup = require('alphabet');
require('novar');
{
  window.init();
  module.exports = soup.eatWith('spoon');
}
