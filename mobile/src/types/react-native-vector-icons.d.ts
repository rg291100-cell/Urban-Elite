declare module 'react-native-vector-icons/MaterialCommunityIcons' {
    import { Component } from 'react';
    import { TextStyle, ViewStyle } from 'react-native';

    interface IconProps {
        name: string;
        size?: number;
        color?: string;
        style?: TextStyle | ViewStyle;
    }

    export default class MaterialCommunityIcons extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/MaterialIcons' {
    import { Component } from 'react';
    import { TextStyle, ViewStyle } from 'react-native';

    interface IconProps {
        name: string;
        size?: number;
        color?: string;
        style?: TextStyle | ViewStyle;
    }

    export default class MaterialIcons extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/Ionicons' {
    import { Component } from 'react';
    import { TextStyle, ViewStyle } from 'react-native';

    interface IconProps {
        name: string;
        size?: number;
        color?: string;
        style?: TextStyle | ViewStyle;
    }

    export default class Ionicons extends Component<IconProps> { }
}

declare module 'react-native-vector-icons/FontAwesome5' {
    import { Component } from 'react';
    import { TextStyle, ViewStyle } from 'react-native';

    interface IconProps {
        name: string;
        size?: number;
        color?: string;
        style?: TextStyle | ViewStyle;
        solid?: boolean;
    }

    export default class FontAwesome5 extends Component<IconProps> { }
}
