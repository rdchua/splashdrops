import React from 'react';
import PropTypes from 'prop-types';
import { Image, TouchableOpacity, ImageBackground, StyleSheet, View, Text } from 'react-native';
import resolveAssetSource from 'react-native/Libraries/Image/resolveAssetSource';
import VectorIcon from 'react-native-vector-icons/Feather';

export default class ImageResize extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            size: {
                width: null,
                height: null,
            }
        };

        this.mounted = false;
    }

    componentDidMount() {
        this.mounted = true;
        this.onProps(this.props);
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentWillReceiveProps(nextProps) {
        this.onProps(nextProps);
    }

    onProps(props) {
        if (props.source.uri) {
            const source = props.source.uri ? props.source.uri : props.source;
            Image.getSize(source, (width, height) => this.adjustSize(width, height, props));
        }
        else {
            const source = resolveAssetSource(props.source);
            this.adjustSize(source.width, source.height, props);
        }
    }

    adjustSize(sourceWidth, sourceHeight, props) {
        const { width, height, maxWidth, maxHeight, data } = props;

        let ratio = 1;

        if (width && height) {
            ratio = Math.min(width / sourceWidth, height / sourceHeight);
        }
        else if (width) {
            ratio = width / sourceWidth;
        }
        else if (height) {
            ratio = height / sourceHeight;
        }

        // Deprecated stuff. Added the PR by mistake. You should use only width and height props
        if (maxWidth && sourceWidth * ratio > maxWidth) {
            ratio = maxWidth / sourceWidth;
        }

        if (maxHeight && sourceHeight * ratio > maxHeight) {
            ratio = maxHeight / sourceHeight;
        }

        if (this.mounted) {
            this.setState({
                size: {
                    width: sourceWidth * ratio,
                    height: sourceHeight * ratio
                }
            }, () => this.props.onSize(this.state.size));
        }
    }

    render() {
        const ImageComponent = this.props.background ? ImageBackground : Image;
        const image = <ImageComponent { ...this.props } style={[this.props.style, this.state.size]}/>;
        const image2 = <ImageComponent { ...this.props } style={[this.props.style, {width: this.state.size.width, height: this.state.size.height}]}/>;

        return(
            this.state.size < this.props.height/2 ? 
            <View>
                {image}
            </View>
            :
            <View>
                {image2}
            </View>
        );
    }
}

ImageResize.propTypes = {
    width: PropTypes.number,
    height: PropTypes.number,
    onPress: PropTypes.func,
    onSize: PropTypes.func,
    background: PropTypes.bool,
    data: PropTypes.object,
};

ImageResize.defaultProps = {
    background: false,
    onSize: size => {}
};

const styles = StyleSheet.create({
    userName: {
        position: 'absolute',
        bottom: 15,
        left: 10,
        fontSize: 12,
        color: 'white',
        fontFamily: 'Metropolis-Medium',
        letterSpacing: 1.2
    },
    actionContainer: {
        position: 'absolute',
        flexDirection: 'row',
        bottom: 15,
        right: 10
    },
    actionIcon: {
        paddingHorizontal: 10
    },
    overlay: {
        position: 'absolute',
        left: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        borderRadius: 0,
        backgroundColor: 'rgba(0,0,0,.2)',
        justifyContent: 'center',
        alignContent: 'center',
    },
    nameContainer: {
        position: 'absolute',
        left: 15,
        top: 20,
        paddingVertical: 10,
    },
    collectionName: {
        marginTop: 5,
        fontSize: 20,
        lineHeight: 20,
        color: '#fff',
        fontSize: 14, 
        fontFamily: 'Metropolis-Bold', 
        letterSpacing: 1.2
    },
    userContainer: {
        position: 'absolute',
        bottom: 20,
        left: 15,
        flexDirection: 'row',
    },
    avatar: {
        width: 25,
        height: 25,
    },
    subinfo: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'Metropolis-Regular',
    },
    userNameCollection: {
        fontSize: 12,
        marginLeft: 10,
        color: '#fff',
        fontFamily: 'Metropolis-Regular',
        alignSelf: 'center',
    } 
});
