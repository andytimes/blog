'use strict';

hexo.extend.helper.register('page_title', function() {
  let title = this.page && this.page.title || '';

  if (this.is_archive()) {
    title = '归档';

    if (this.is_month()) {
      title += `: ${this.page.year}/${this.page.month}`
    } else if (this.is_year()) {
      title += `: ${this.page.year}`;
    }
  } else if (this.is_category()) {
    title = `分类: ${this.page.category}`;
  } else if (this.is_tag()) {
    title = `标签: ${this.page.tag}`;
  }

  if (title) {
    return `${title} | ${this.config.title}`;
  }

  return this.config.title;
});
