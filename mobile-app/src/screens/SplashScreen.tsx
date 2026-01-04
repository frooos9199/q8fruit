
import React, { useEffect, useRef } from 'react';
import { View, Text, StatusBar, StyleSheet, Dimensions, Animated } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ onFinish = () => {} }) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 3500,
        useNativeDriver: false,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container} onLayout={() => {}}>
      <StatusBar barStyle="light-content" backgroundColor="#22c55e" />
      {/* الخلفية المتدرجة */}
      <LinearGradient
        colors={['#22c55e', '#16a34a', '#15803d']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      {/* النجوم المتحركة في الخلفية */}
      <View style={styles.starsContainer}>
        {[...Array(20)].map((_, i) => (
          <Animatable.Text
            key={i}
            animation="pulse"
            iterationCount="infinite"
            duration={2000 + (i * 100)}
            style={[
              styles.star,
              {
                left: Math.random() * width,
                top: Math.random() * height,
                animationDelay: `${i * 200}ms`,
              },
            ]}
          >
            ✨
          </Animatable.Text>
        ))}
      </View>
      {/* المحتوى الرئيسي */}
      <View style={styles.content}>
        {/* الشعار والأيقونة */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Animatable.View
            animation="bounce"
            iterationCount="infinite"
            duration={2000}
            style={styles.iconContainer}
          >
            <Text style={styles.icon}>🍎</Text>
            <View style={styles.iconGlow} />
          </Animatable.View>
          <Animated.Text
            style={[
              styles.title,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            فكهاني الكويت
          </Animated.Text>
          <Animated.Text
            style={[
              styles.subtitle,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            طازج • طبيعي • صحي
          </Animated.Text>
          <Animated.Text
            style={[
              styles.slogan,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            من المزرعة إلى بيتك 🚚
          </Animated.Text>
        </Animated.View>
        {/* مؤشر التحميل المتقدم */}
        <Animated.View
          style={[
            styles.loadingContainer,
            { opacity: fadeAnim },
          ]}
        >
          <View style={styles.loadingBar}>
            <Animated.View
              style={[
                styles.loadingProgress,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
            <View style={styles.loadingShine} />
          </View>
          <Animatable.Text
            animation="pulse"
            iterationCount="infinite"
            style={styles.loadingText}
          >
            جاري تحضير أطيب الفواكه...
          </Animatable.Text>
        </Animated.View>
        {/* معلومات التواصل */}
        <Animatable.View
          animation="fadeInUp"
          delay={2000}
          style={styles.footer}
        >
          <View style={styles.contactInfo}>
            <Text style={styles.phoneNumber}>📞 98899426</Text>
            <Text style={styles.location}>📍 الكويت</Text>
          </View>
          <View style={styles.brandInfo}>
            <Text style={styles.footerText}>صُنع بـ ❤️ في الكويت 🇰🇼</Text>
            <Text style={styles.version}>الإصدار 1.0.0</Text>
          </View>
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  starsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  star: {
    position: 'absolute',
    fontSize: 12,
    opacity: 0.7,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.3,
    shadowRadius: 25,
    elevation: 15,
    position: 'relative',
  },
  icon: {
    fontSize: 70,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  iconGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -10,
    left: -10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 10,
  },
  slogan: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  loadingContainer: {
    width: width - 80,
    alignItems: 'center',
    marginBottom: 60,
  },
  loadingBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
  },
  loadingProgress: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  loadingShine: {
    position: 'absolute',
    top: 0,
    left: -100,
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
    width: '100%',
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 15,
  },
  phoneNumber: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  location: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '600',
  },
  brandInfo: {
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    marginBottom: 5,
  },
  version: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
  },
});

export default SplashScreen;