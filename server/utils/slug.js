const slugify = require('slugify');

function toSlug(text) {
  return slugify(text, {
    lower: true,
    strict: true,
    trim: true
  });
}

async function uniqueSlug(base, existsFn) {
  let slug = toSlug(base);
  let counter = 2;

  while (await existsFn(slug)) {
    slug = `${toSlug(base)}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = { toSlug, uniqueSlug };