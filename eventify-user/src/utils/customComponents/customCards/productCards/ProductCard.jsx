import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {theme} from '../../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const ProductCard = ({title, imageUrl, onPress}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{scale: scaleAnim}],
          },
        ]}>
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image source={{uri: imageUrl}} style={styles.image} />
          ) : (
            <View style={styles.placeholder}>
              <Ionicons
                name="image-outline"
                size={width * 0.08}
                color={theme.colors.gray}
              />
            </View>
          )}
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    width: width * 0.42,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.large,
    padding: width * 0.02,
    marginBottom: height * 0.02,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },

  imageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.gray,
    overflow: 'hidden',
    marginBottom: height * 0.012,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.dark,
    textAlign: 'center',
  },
});
