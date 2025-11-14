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

const CartCard = ({
  title,
  price,
  imageUrl,
  onRemove,
  onIncrease,
  onDecrease,
  quantity,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
      ]}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{uri: imageUrl}} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="image-outline"
              size={width * 0.08}
              color={theme.colors.gray}
            />
          </View>
        )}
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </Text>

        <Text style={styles.price}>PKR{price}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={onDecrease}
            style={styles.quantityButton}
            activeOpacity={0.6}>
            <Ionicons
              name="remove"
              size={width * 0.04}
              color={theme.colors.white}
            />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity
            onPress={onIncrease}
            style={styles.quantityButton}
            activeOpacity={0.6}>
            <Ionicons
              name="add"
              size={width * 0.04}
              color={theme.colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        onPress={onRemove}
        style={styles.removeButton}
        activeOpacity={0.5}>
        <Ionicons
          name="close-circle"
          size={width * 0.08}
          color={theme.colors.error}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default CartCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    padding: width * 0.04,
    marginVertical: height * 0.01,
    borderRadius: theme.borderRadius.medium,
    shadowColor: theme.colors.primary,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  imageContainer: {
    width: width * 0.34,
    height: width * 0.3,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: width * 0.04,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
    gap: theme.gap(1),
  },

  title: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.dark,
  },

  price: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.primary,
  },

  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  quantityButton: {
    width: width * 0.06,
    height: width * 0.06,
    borderRadius: width * 0.03,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.dark,
    marginHorizontal: width * 0.03,
  },

  removeButton: {
    padding: width * 0.02,
    alignSelf: 'flex-start',
  },
});
