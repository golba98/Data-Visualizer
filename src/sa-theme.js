var SATheme = {
  bg: '#121316',
  text: '#F5F7FA',
  textMuted: '#B8BDC8',
  axis: '#687180',
  grid: '#303640',
  green: '#22C55E',
  gold: '#F5C451',
  red: '#F87171',
  redRGB: [248, 113, 113],
  blue: '#60A5FA',
  blueRGB: [96, 165, 250],
  orange: '#FB923C',
  blueTint: '#93C5FD',
  categorical: ['#60A5FA', '#F5C451', '#22C55E', '#F87171', '#A78BFA', '#22D3EE', '#FB923C'],

  withAlpha: function(rgb, alpha) {
    return color(rgb[0], rgb[1], rgb[2], alpha);
  },

  pressure: {
    Food: '#F5C451',
    Transport: '#60A5FA',
    Data: '#22D3EE',
    Rent: '#A78BFA',
    Tuition: '#F87171',
    Debt: '#FB923C',
    Electricity: '#22C55E'
  }
};
