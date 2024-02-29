const Typography = ({ variant, text }) => {
  let Component;

  switch (variant) {
    case 'p':
      Component = 'p';
      break;
    case 'h1':
      Component = 'h1';
      break;
    case 'h2':
      Component = 'h2';
      break;
    case 'h3':
      Component = 'h3';
      break;
    case 'h4':
      Component = 'h4';
      break;
    case 'h5':
      Component = 'h5';
      break;
    case 'h6':
      Component = 'h6';
      break;

    default:
      Component = 'div';
  }

  return (
    <Component>
      {text}
    </Component>
  );
};

export default Typography;
