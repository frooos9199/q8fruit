declare module 'react-native-animatable' {
  import { Component, ReactNode } from 'react';
  import { ViewProps, TextProps, ImageProps } from 'react-native';

  export type Animation = string;
  export type Easing = string;

  export interface AnimatableViewProps extends ViewProps {
    animation?: Animation;
    duration?: number;
    delay?: number;
    iterationCount?: number | 'infinite';
    direction?: 'normal' | 'reverse' | 'alternate' | 'alternate-reverse';
    easing?: Easing;
    style?: any;
    children?: ReactNode;
  }

  export class View extends Component<AnimatableViewProps> {}
  export class Text extends Component<AnimatableViewProps & TextProps> {}
  export class Image extends Component<AnimatableViewProps & ImageProps> {}
  export function createAnimatableComponent<P>(component: React.ComponentType<P>): React.ComponentType<P & AnimatableViewProps>;
  export * from 'react-native';
}
