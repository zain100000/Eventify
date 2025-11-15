import React, {useRef, useEffect} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
// Assuming 'theme' and 'globalStyles' are defined in your project
// import {theme} from '../../styles/theme';
// import {globalStyles} from '../../styles/globalStyles';

// --- Placeholder Theme for demonstration ---
const theme = {
  colors: {
    primary: '#1A73E8', // Blue
    secondary: '#3C4043', // Dark Gray
    tertiary: '#5F6368', // Medium Gray
    white: '#FFFFFF',
    background: '#F5F5F5', // Light background for elegance
    border: '#E0E0E0',
    success: '#00B894',
    warning: '#FBC02D',
  },
  typography: {
    fontSize: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 20,
      xl: 24,
      xxl: 30,
    },
    roboto: {
      light: 'Roboto-Light',
      regular: 'Roboto-Regular',
      medium: 'Roboto-Medium',
      bold: 'Roboto-Bold',
    },
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 24,
  },
};
const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
};
// ------------------------------------------

import Header from '../../utils/customComponents/customHeader/Header';

const {width, height} = Dimensions.get('screen');
const IMAGE_HEIGHT = height * 0.5;

const EventDetails = () => {
  const navigation = useNavigation();
  const {event} = useRoute().params;
  const bottomSheetAnim = useRef(new Animated.Value(height)).current;

  // Animation for the bottom sheet to slide up gracefully
  useEffect(() => {
    Animated.timing(bottomSheetAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [bottomSheetAnim]);

  // Handle buying a specific ticket type
  const handleBuyTicket = ticketType => {
    // We can also pass the ticket's availability check here
    if (ticketType.quantity - ticketType.sold <= 0) {
      // You might want to show an alert or a toast here
      console.log(`Ticket ${ticketType.name} is sold out!`);
      return;
    }
    navigation.navigate('BuyTicket', {event, ticketType});
  };

  const renderTicketType = ({item}) => {
    const isSoldOut = item.quantity - item.sold <= 0;

    return (
      <View
        style={[
          styles.ticketCard,
          isSoldOut && styles.soldOutCard, // Apply distinct style if sold out
        ]}>
        <View style={styles.ticketDetails}>
          <Text style={styles.ticketName}>{item.name}</Text>
          <Text style={styles.ticketPrice}>
            <Text style={styles.currencySymbol}>PKR</Text> {item.price}
          </Text>
          <Text style={styles.ticketAvailability}>
            {isSoldOut ? (
              <Text style={{color: theme.colors.warning, fontWeight: '700'}}>
                Sold Out
              </Text>
            ) : (
              <>
                <Text style={{color: theme.colors.success, fontWeight: '700'}}>
                  {item.quantity - item.sold}
                </Text>{' '}
                Tickets Available
              </>
            )}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.buyBtn, isSoldOut && styles.soldOutBtn]}
          onPress={() => handleBuyTicket(item)}
          disabled={isSoldOut}>
          <Text style={styles.buyBtnText}>
            {isSoldOut ? 'Unavailable' : 'Buy Now'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEventImage = ({item}) => (
    <Image source={{uri: item.url}} style={styles.eventImage} />
  );

  return (
    <SafeAreaView style={[globalStyles.container, styles.primaryContainer]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Header
          title={event.title}
          onPressLeft={() => navigation.goBack()}
          transparent
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Images */}
        <FlatList
          data={event.eventImage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item._id}
          renderItem={renderEventImage}
          style={styles.galleryContainer}
        />

        {/* Animated Bottom Sheet/Content Area */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {transform: [{translateY: bottomSheetAnim}]},
          ]}>
          <Text style={styles.title}>{event.title}</Text>

          {/* Date & Time */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>🗓️ Date & Time</Text>
            <Text style={styles.infoValue}>
              <Text style={styles.boldText}>
                {new Date(event.dateTime.start).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>{' '}
              from{' '}
              <Text style={styles.boldText}>
                {new Date(event.dateTime.start).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>{' '}
              to{' '}
              <Text style={styles.boldText}>
                {new Date(event.dateTime.end).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Venue - Enhanced Structure */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>📍 Event Location</Text>
            <View style={styles.venueDetailBox}>
              <Text style={styles.venueName}>{event.venue.name}</Text>
              <Text style={styles.venueAddress}>{event.venue.address}</Text>
              <Text style={styles.venueCity}>{event.venue.city}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Organizer */}
          <View style={styles.infoContainer}>
            <Text style={styles.infoLabel}>🧑‍💼 Organized By</Text>
            <View style={styles.organizerRow}>
              <Image
                source={{
                  uri: event.organizer.organizerProfile.profilePicture,
                }}
                style={styles.organizerImage}
              />
              <View>
                <Text style={styles.organizerName}>
                  {event.organizer.userName}
                </Text>
                <Text style={styles.organizerServices}>
                  Services:{' '}
                  {event.organizer.organizerProfile.services.join(', ')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.infoContainer}>
            <Text style={styles.sectionTitle}>ℹ️ About This Event</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.divider} />

          {/* Tickets - Redesigned with individual buttons */}
          <View style={styles.ticketContainer}>
            <Text style={styles.sectionTitle}>🎟️ Available Tickets</Text>
            <FlatList
              data={event.ticketConfig.ticketTypes}
              renderItem={renderTicketType}
              keyExtractor={item => item._id}
              scrollEnabled={false}
            />
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EventDetails;

const styles = StyleSheet.create({
  primaryContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  galleryContainer: {
    height: IMAGE_HEIGHT,
  },
  eventImage: {
    width: width,
    height: IMAGE_HEIGHT,
    resizeMode: 'cover',
  },
  bottomSheet: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.03,
    marginTop: -theme.borderRadius.large * 1.5, // Pull the sheet higher for a more dramatic effect
    borderTopLeftRadius: theme.borderRadius.large * 1.2, // Slightly larger radius
    borderTopRightRadius: theme.borderRadius.large * 1.2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15, // Increased shadow for depth
    shadowRadius: 15,
    elevation: 15,
    paddingBottom: height * 0.05,
    minHeight: height * 0.5,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.secondary, // Changed title color to secondary for contrast
    marginBottom: height * 0.025, // Increased spacing
    lineHeight: theme.typography.fontSize.xxl * 1.1,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.tertiary,
    lineHeight: 22,
    marginBottom: height * 0.01,
  },
  infoContainer: {
    marginBottom: height * 0.02,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.secondary,
    marginBottom: 8, // Increased spacing
    borderLeftWidth: 4, // Thicker border
    borderLeftColor: theme.colors.primary,
    paddingLeft: 10,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.secondary,
    marginLeft: 14,
  },
  boldText: {
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.primary,
  },
  // --- Enhanced Venue Styling ---
  venueDetailBox: {
    backgroundColor: theme.colors.background,
    padding: 15,
    borderRadius: theme.borderRadius.medium,
    marginLeft: 14,
  },
  venueName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  venueAddress: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.secondary,
  },
  venueCity: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.tertiary,
    marginTop: 2,
  },
  // --- End Enhanced Venue Styling ---
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 14,
  },
  organizerImage: {
    width: width * 0.1,
    height: width * 0.1,
    borderRadius: width * 0.05,
    marginRight: width * 0.03,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  organizerName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.medium,
    color: theme.colors.secondary,
  },
  organizerServices: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.roboto.light,
    color: theme.colors.tertiary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: height * 0.02,
    marginHorizontal: -width * 0.05,
  },
  ticketContainer: {
    marginBottom: height * 0.03,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.secondary,
    marginBottom: height * 0.015,
  },
  // Ticket Card
  ticketCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 18,
    borderRadius: theme.borderRadius.medium,
    marginBottom: 12, // Increased vertical rhythm
    borderLeftWidth: 5,
    borderLeftColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  soldOutCard: {
    opacity: 0.6,
    borderLeftColor: theme.colors.tertiary, // Dim the border color
  },
  ticketDetails: {
    flex: 1,
    paddingRight: 10,
  },
  ticketName: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.secondary,
    marginBottom: 2,
  },
  ticketPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.roboto.bold,
    color: theme.colors.primary,
    marginBottom: 4,
  },
  currencySymbol: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.tertiary,
  },
  ticketAvailability: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.roboto.regular,
    color: theme.colors.tertiary,
  },
  buyBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.small,
    marginLeft: 15,
  },
  soldOutBtn: {
    backgroundColor: theme.colors.tertiary, // Change color for sold out state
  },
  buyBtnText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.roboto.medium,
  },
});
