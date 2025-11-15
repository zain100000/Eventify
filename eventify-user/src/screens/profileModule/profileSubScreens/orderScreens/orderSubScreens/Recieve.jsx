import React, {useEffect, useRef, useState, useMemo} from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Dimensions,
  Animated,
  FlatList,
} from 'react-native';
import {globalStyles} from '../../../../../styles/globalStyles';
import {theme} from '../../../../../styles/theme';
import {useDispatch, useSelector} from 'react-redux';
import {getAllOrders} from '../../../../../redux/slices/orderSlice';
import Loader from '../../../../../utils/customComponents/customLoader/Loader';
import OrderCard from '../../../../../utils/customComponents/customCards/orderCard/OrderCard';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import InputField from '../../../../../utils/customComponents/customInputField/InputField';

const {width, height} = Dimensions.get('screen');

const Received = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showNoOrders, setShowNoOrders] = useState(false);

  const fadeAnim = useState(new Animated.Value(0))[0];
  const noOrderFadeAnim = useRef(new Animated.Value(0)).current;
  const noOrderBounceAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const bounceAnim = useState(new Animated.Value(30))[0];

  const user = useSelector(state => state.auth.user);
  const {orders} = useSelector(state => state.order);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    setLoading(true);
    dispatch(getAllOrders())
      .catch(error => console.log('Error fetching orders:', error))
      .finally(() => setLoading(false));
  }, [dispatch]);

  const userOrders =
    orders?.filter(order => {
      const userId = order.orderId?.userId?._id || order.userId?._id;
      const status = order.orderId?.status || order.status;
      return (
        userId === user.id &&
        ['READY_FOR_PICKUP', 'PICKED_UP', 'COMPLETED'].includes(status)
      );
    }) || [];

  const filteredOrders = useMemo(() => {
    return userOrders.filter(order => {
      const orderData = order.orderId || order;
      const product = orderData.items?.[0]?.productId || orderData.items?.[0];
      const title = product?.title || '';
      return title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [userOrders, searchQuery]);

  useEffect(() => {
    if (!loading && filteredOrders.length === 0) {
      setShowNoOrders(true);
      Animated.parallel([
        Animated.timing(noOrderFadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(noOrderBounceAnim, {
              toValue: 10,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(noOrderBounceAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]),
        ),
      ]).start();
    } else {
      setShowNoOrders(false);
    }
  }, [filteredOrders, loading]);

  const renderItem = ({item}) => {
    const order = item.orderId || item;
    const firstItem = order.items[0]?.productId || order.items[0];

    return (
      <OrderCard
        title={firstItem?.title || 'Product Name'}
        price={firstItem?.price || '0'}
        quantity={order.items[0]?.quantity || 1}
        status={order.status || 'Delivered'}
        imageUrl={firstItem?.productImage || ''}
      />
    );
  };

  return (
    <SafeAreaView style={[globalStyles.container]}>
      <Animated.View
        style={[
          styles.searchContainer,
          {opacity: fadeAnim, transform: [{scale: scaleAnim}]},
        ]}>
        <InputField
          placeholder="Search"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          leftIcon={
            <Feather
              name={'search'}
              size={width * 0.044}
              color={theme.colors.primary}
            />
          }
        />
      </Animated.View>

      <View style={styles.ordersContainer}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <Loader />
          </View>
        ) : filteredOrders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) =>
              item._id?.toString() || index.toString()
            }
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        ) : showNoOrders ? (
          <Animated.View
            style={[
              styles.noOrderView,
              {
                opacity: noOrderFadeAnim,
                transform: [{translateY: noOrderBounceAnim}],
              },
            ]}>
            <FontAwesome6
              name={'box-open'}
              size={width * 0.28}
              color={theme.colors.primary}
            />
            <Text style={styles.noOrderTitle}>
              No orders ready or completed!
            </Text>
          </Animated.View>
        ) : null}
      </View>
    </SafeAreaView>
  );
};

export default Received;

const styles = StyleSheet.create({
  ordersContainer: {
    flex: 1,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noOrderView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.gap(2),
  },

  noOrderTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.poppins.semiBold,
    color: theme.colors.primary,
    textAlign:'center'
  },

  listContent: {
    paddingBottom: height * 0.1,
    marginTop: height * 0.02,
  },

  searchContainer: {
    marginTop: height * 0.02,
  },
});
