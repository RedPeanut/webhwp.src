var ghpages = require('gh-pages')

ghpages.publish('dist', {
  branch: 'master',
  repo: 'https://github.com/RedPeanut/webhwp.git',
  dotfiles: true,
})
