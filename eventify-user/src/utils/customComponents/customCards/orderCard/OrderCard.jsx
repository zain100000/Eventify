import React, {useRef, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import {theme} from '../../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const OrderCard = ({title, price, imageUrl, quantity, status}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return '#FFC107';
      case 'cancelled':
        return '#F44336';
      case 'shipped':
        return '#03A9F4';
      case 'delivered':
        return '#4CAF50';
      case 'completed':
        return '#673AB7';
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
      ]}>
      {/* Status Badge */}
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, {backgroundColor: getStatusColor()}]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.content}>
        {/* Image */}
        <Image
          source={imageUrl ? {uri: imageUrl} : null}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Details */}
        <View style={styles.details}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.row}>
            <Text style={styles.price}>Rs. {price}</Text>
            <Text style={styles.qty}>Qty: {quantity}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 16,
    padding: width * 0.04,
    marginVertical: height * 0.01,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: height * 0.01,
  },

  statusBadge: {
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.002,
    borderRadius: theme.borderRadius.large,
  },

  statusText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.medium,
    textTransform: 'capitalize',
    top: height * 0.002,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  image: {
    width: width * 0.16,
    height: width * 0.16,
    borderRadius: theme.borderRadius.large,
    marginRight: width * 0.04,
  },

  details: {
    flex: 1,
    justifyContent: 'space-between',
  },

  title: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.dark,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  price: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.semiBold,
    color: theme.colors.primary,
  },

  qty: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.tertiary,
  },
});
