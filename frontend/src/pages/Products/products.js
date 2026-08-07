/**
 * KHUSHI OPTICS - Products Page (Frames & Lenses catalog)
 */

export const Products = {
  async render() {
    if (window.Frames) window.Frames.render();
    if (window.Lenses) window.Lenses.render();
  }
};

window.Products = Products;
