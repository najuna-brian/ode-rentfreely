declare module '*.png' {
  import {ImageSourcePropType} from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpg' {
  import {ImageSourcePropType} from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.jpeg' {
  import {ImageSourcePropType} from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare module '*.svg' {
  import {ImageSourcePropType} from 'react-native';
  const content: ImageSourcePropType;
  export default content;
}

declare namespace NodeJS {
  interface Timeout {
    ref: () => void;
    unref: () => void;
    refresh: () => void;
    clear: () => void;
  }
}

// Extend the global interface to include the Formulus interface
declare global {
  const formulus: FormulusInterface | undefined;
  const onFormInit: FormulusCallbacks['onFormInit'];
  const onReceiveFocus: FormulusCallbacks['onReceiveFocus'];
}
