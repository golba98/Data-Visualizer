// South African flag-inspired palette, applied to all charts. A restrained
// set of flat colours -- green, gold, red, blue, black (plus white from the
// page background) -- used consistently so a category keeps the same colour
// wherever it appears.
//
// Hex strings can be passed straight to fill()/stroke(); the *RGB triplets
// are for the alpha ramps (heatmap cells, semi-transparent bubbles/circles).
var SATheme = {
  green: '#007A4D',  greenRGB: [0, 122, 77],
  gold:  '#FFB612',  goldRGB:  [255, 182, 18],
  red:   '#DE3831',  redRGB:   [222, 56, 49],
  blue:  '#002395',  blueRGB:  [0, 35, 149],
  black: '#1A1A1A',
  greenTint: '#59A07F',
  blueTint:  '#6E8FD8',

  // p5 color() with alpha, for the heatmap / bubble ramps (called at draw time).
  withAlpha: function(rgb, a) {
    return color(rgb[0], rgb[1], rgb[2], a);
  },

  // Ordered palette for categorical charts (pie slices, line series, bar components).
  categorical: ['#007A4D', '#FFB612', '#DE3831', '#002395', '#1A1A1A'],

  // Shared mapping for the 7 survey pressure categories, used by both the
  // stacked-bar and waffle charts so a category keeps the same colour in each.
  // Ordered so neighbouring bars avoid similar hues.
  pressure: {
    Food: '#007A4D',
    Transport: '#DE3831',
    Data: '#002395',
    Rent: '#FFB612',
    Tuition: '#1A1A1A',
    Debt: '#6E8FD8',
    Electricity: '#59A07F'
  }
};
