import React, {useRef, useEffect, useState} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import LottieView from 'lottie-react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {theme} from '../../../styles/theme';

const {width, height} = Dimensions.get('screen');

const ReviewCarousel = ({reviews}) => {
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % reviews.length;
        sliderRef.current?.goToSlide(nextIndex, true);
        return nextIndex;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const renderItem = ({item}) => (
    <View style={styles.slide}>
      <Text style={styles.reviewText}>"{item.text}"</Text>
      <Text style={styles.customerName}>- {item.name}</Text>
    </View>
  );

  const renderPagination = activeIndex => {
    return (
      <View style={styles.paginationContainer}>
        {reviews.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LottieView
        source={reviews[0].animation}
        autoPlay
        loop
        style={styles.animation}
      />
      <AppIntroSlider
        ref={sliderRef}
        data={reviews}
        renderItem={renderItem}
        scrollEnabled={false}
        onSlideChange={index => setCurrentIndex(index)}
        showPrevButton={false}
        showNextButton={false}
        showDoneButton={false}
        renderPagination={renderPagination}
      />
    </View>
  );
};

export default ReviewCarousel;

const styles = StyleSheet.create({
  container: {
    height: height * 0.44,
    justifyContent: 'center',
  },

  animation: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: height * 0.02,
    alignSelf: 'center',
  },

  slide: {
    paddingHorizontal: width * 0.1,
  },

  reviewText: {
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    color: theme.colors.white,
    lineHeight: theme.typography.lineHeight.md,
    marginBottom: height * 0.02,
    fontFamily: theme.typography.roboto.regular,
    fontStyle: 'italic',
  },

  customerName: {
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'right',
    color: theme.colors.white,
    lineHeight: theme.typography.lineHeight.md,
    marginBottom: height * 0.02,
    fontFamily: theme.typography.roboto.regular,
    fontStyle: 'italic',
  },

  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: width * 0.02,
  },

  dot: {
    width: width * 0.024,
    height: width * 0.024,
    borderRadius: theme.borderRadius.circle,
    backgroundColor: theme.colors.gray,
  },

  activeDot: {
    backgroundColor: theme.colors.primary,
  },
});
