import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, KeyboardAvoidingView, Platform, Alert,
  Animated, Easing, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';
import SplashScreen from '../components/splashscreen';

const JOB_TYPES = ['Full Time', 'Part Time', 'Remote', 'Contract', 'Daily Basis'];
const CATEGORIES = [
  'Technology',
  'Design',
  'Marketing',
  'Finance',
  'Education',
  'Healthcare',
  'Engineering',
  'Sales',
  'Legal',
  'HR',
  'Media',
  'Hospitality',
  'Construction',
  'Logistics',
  'Customer Support',
  'Administration',
  'Accounting',
  'Real Estate',
  'Retail',
  'Manufacturing',
  'Agriculture',
  'Security',
  'Government',
  'Non-Profit',
  'Research',
  'Freelance',
  'Internship'
];
const EXPERIENCE_LEVELS = ['Entry Level', 'Intermediate', 'Expert'];


const COUNTRIES = [
  { name: 'Global (All over the world)', flag: '🌐', cities: ['All over the world'] },
  { name: 'Pakistan', flag: '🇵🇰', cities: ['All over the country', 'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur'] },
  { name: 'India', flag: '🇮🇳', cities: ['All over the country', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur'] },
  { name: 'United Arab Emirates', flag: '🇦🇪', cities: ['All over the country', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Fujairah'] },
  { name: 'Saudi Arabia', flag: '🇸🇦', cities: ['All over the country', 'Riyadh', 'Jeddah', 'Dammam', 'Makkah', 'Madinah', 'Khobar'] },
  { name: 'Qatar', flag: '🇶🇦', cities: ['All over the country', 'Doha', 'Al Wakrah', 'Al Khor'] },
  { name: 'Kuwait', flag: '🇰🇼', cities: ['All over the country', 'Kuwait City', 'Hawalli', 'Salmiya'] },
  { name: 'Bahrain', flag: '🇧🇭', cities: ['All over the country', 'Manama', 'Riffa', 'Muharraq'] },
  { name: 'Oman', flag: '🇴🇲', cities: ['All over the country', 'Muscat', 'Salalah', 'Sohar'] },
  { name: 'United States', flag: '🇺🇸', cities: ['All over the country', 'New York', 'Los Angeles', 'Chicago', 'Houston', 'San Francisco', 'Seattle', 'Miami', 'Boston', 'Dallas', 'Atlanta'] },
  { name: 'Canada', flag: '🇨🇦', cities: ['All over the country', 'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'] },
  { name: 'United Kingdom', flag: '🇬🇧', cities: ['All over the country', 'London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Liverpool', 'Leeds'] },
  { name: 'Germany', flag: '🇩🇪', cities: ['All over the country', 'Berlin', 'Munich', 'Frankfurt', 'Hamburg', 'Cologne', 'Stuttgart'] },
  { name: 'France', flag: '🇫🇷', cities: ['All over the country', 'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux'] },
  { name: 'Italy', flag: '🇮🇹', cities: ['All over the country', 'Rome', 'Milan', 'Naples', 'Turin', 'Florence'] },
  { name: 'Spain', flag: '🇪🇸', cities: ['All over the country', 'Madrid', 'Barcelona', 'Valencia', 'Seville', 'Bilbao'] },
  { name: 'Netherlands', flag: '🇳🇱', cities: ['All over the country', 'Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht'] },
  { name: 'Switzerland', flag: '🇨🇭', cities: ['All over the country', 'Zurich', 'Geneva', 'Bern', 'Basel'] },
  { name: 'Sweden', flag: '🇸🇪', cities: ['All over the country', 'Stockholm', 'Gothenburg', 'Malmo'] },
  { name: 'Norway', flag: '🇳🇴', cities: ['All over the country', 'Oslo', 'Bergen', 'Stavanger'] },
  { name: 'Denmark', flag: '🇩🇰', cities: ['All over the country', 'Copenhagen', 'Aarhus', 'Odense'] },
  { name: 'Ireland', flag: '🇮🇪', cities: ['All over the country', 'Dublin', 'Cork', 'Galway', 'Limerick'] },
  { name: 'Australia', flag: '🇦🇺', cities: ['All over the country', 'Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra'] },
  { name: 'New Zealand', flag: '🇳🇿', cities: ['All over the country', 'Auckland', 'Wellington', 'Christchurch'] },
  { name: 'China', flag: '🇨🇳', cities: ['All over the country', 'Beijing', 'Shanghai', 'Shenzhen', 'Guangzhou', 'Chengdu', 'Hangzhou'] },
  { name: 'Japan', flag: '🇯🇵', cities: ['All over the country', 'Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Kyoto'] },
  { name: 'South Korea', flag: '🇰🇷', cities: ['All over the country', 'Seoul', 'Busan', 'Incheon', 'Daegu'] },
  { name: 'Singapore', flag: '🇸🇬', cities: ['Singapore City'] },
  { name: 'Malaysia', flag: '🇲🇾', cities: ['All over the country', 'Kuala Lumpur', 'Penang', 'Johor Bahru', 'Kota Kinabalu'] },
  { name: 'Indonesia', flag: '🇮🇩', cities: ['All over the country', 'Jakarta', 'Surabaya', 'Bandung', 'Bali'] },
  { name: 'Philippines', flag: '🇵🇭', cities: ['All over the country', 'Manila', 'Cebu', 'Davao', 'Quezon City'] },
  { name: 'Thailand', flag: '🇹🇭', cities: ['All over the country', 'Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya'] },
  { name: 'Vietnam', flag: '🇻🇳', cities: ['All over the country', 'Ho Chi Minh City', 'Hanoi', 'Da Nang'] },
  { name: 'Bangladesh', flag: '🇧🇩', cities: ['All over the country', 'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'] },
  { name: 'Sri Lanka', flag: '🇱🇰', cities: ['All over the country', 'Colombo', 'Kandy', 'Galle'] },
  { name: 'Turkey', flag: '🇹🇷', cities: ['All over the country', 'Istanbul', 'Ankara', 'Izmir', 'Antalya', 'Bursa'] },
  { name: 'Egypt', flag: '🇪🇬', cities: ['All over the country', 'Cairo', 'Alexandria', 'Giza', 'Luxor'] },
  { name: 'South Africa', flag: '🇿🇦', cities: ['All over the country', 'Johannesburg', 'Cape Town', 'Durban', 'Pretoria'] },
  { name: 'Nigeria', flag: '🇳🇬', cities: ['All over the country', 'Lagos', 'Abuja', 'Port Harcourt', 'Kano'] },
  { name: 'Kenya', flag: '🇰🇪', cities: ['All over the country', 'Nairobi', 'Mombasa', 'Kisumu'] },
  { name: 'Morocco', flag: '🇲🇦', cities: ['All over the country', 'Casablanca', 'Rabat', 'Marrakech', 'Fez'] },
  { name: 'Brazil', flag: '🇧🇷', cities: ['All over the country', 'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'] },
  { name: 'Mexico', flag: '🇲🇽', cities: ['All over the country', 'Mexico City', 'Guadalajara', 'Monterrey', 'Cancún'] },
  { name: 'Argentina', flag: '🇦🇷', cities: ['All over the country', 'Buenos Aires', 'Córdoba', 'Rosario'] },
  { name: 'Colombia', flag: '🇨🇴', cities: ['All over the country', 'Bogotá', 'Medellín', 'Cali', 'Cartagena'] },
  { name: 'Chile', flag: '🇨🇱', cities: ['All over the country', 'Santiago', 'Valparaíso', 'Concepción'] },
  { name: 'Russia', flag: '🇷🇺', cities: ['All over the country', 'Moscow', 'Saint Petersburg', 'Novosibirsk', 'Kazan'] },
  { name: 'Poland', flag: '🇵🇱', cities: ['All over the country', 'Warsaw', 'Kraków', 'Wrocław', 'Gdańsk'] },
  { name: 'Portugal', flag: '🇵🇹', cities: ['All over the country', 'Lisbon', 'Porto', 'Faro'] },
  { name: 'Belgium', flag: '🇧🇪', cities: ['All over the country', 'Brussels', 'Antwerp', 'Ghent'] },
  { name: 'Austria', flag: '🇦🇹', cities: ['All over the country', 'Vienna', 'Salzburg', 'Graz'] },
  { name: 'Greece', flag: '🇬🇷', cities: ['All over the country', 'Athens', 'Thessaloniki', 'Patras'] },
  { name: 'Czech Republic', flag: '🇨🇿', cities: ['All over the country', 'Prague', 'Brno', 'Ostrava'] },
  { name: 'Romania', flag: '🇷🇴', cities: ['All over the country', 'Bucharest', 'Cluj-Napoca', 'Timișoara'] },
  { name: 'Hungary', flag: '🇭🇺', cities: ['All over the country', 'Budapest', 'Debrecen', 'Szeged'] },
  { name: 'Finland', flag: '🇫🇮', cities: ['All over the country', 'Helsinki', 'Tampere', 'Espoo'] },
  { name: 'Iraq', flag: '🇮🇶', cities: ['All over the country', 'Baghdad', 'Erbil', 'Basra', 'Sulaymaniyah'] },
  { name: 'Jordan', flag: '🇯🇴', cities: ['All over the country', 'Amman', 'Irbid', 'Aqaba'] },
  { name: 'Lebanon', flag: '🇱🇧', cities: ['All over the country', 'Beirut', 'Tripoli', 'Sidon'] },
  { name: 'Afghanistan', flag: '🇦🇫', cities: ['All over the country', 'Kabul', 'Herat', 'Kandahar', 'Mazar-i-Sharif'] },
  { name: 'Iran', flag: '🇮🇷', cities: ['All over the country', 'Tehran', 'Isfahan', 'Shiraz', 'Tabriz'] },
  { name: 'Nepal', flag: '🇳🇵', cities: ['All over the country', 'Kathmandu', 'Pokhara', 'Lalitpur'] },
];

const CURRENCY_SYMBOLS = {
  'Global (All over the world)': '$',
  'Pakistan': 'Rs',
  'India': '₹',
  'United Arab Emirates': 'AED',
  'Saudi Arabia': 'SAR',
  'Qatar': 'QAR',
  'Kuwait': 'KWD',
  'Bahrain': 'BHD',
  'Oman': 'OMR',
  'United States': '$',
  'Canada': '$',
  'United Kingdom': '£',
  'Germany': '€',
  'France': '€',
  'Italy': '€',
  'Spain': '€',
  'Netherlands': '€',
  'Switzerland': 'CHF',
  'Sweden': 'kr',
  'Norway': 'kr',
  'Denmark': 'kr',
  'Ireland': '€',
  'Australia': '$',
  'New Zealand': '$',
  'China': '¥',
  'Japan': '¥',
  'South Korea': '₩',
  'Singapore': '$',
  'Malaysia': 'RM',
  'Indonesia': 'Rp',
  'Philippines': '₱',
  'Thailand': '฿',
  'Vietnam': '₫',
  'Bangladesh': '৳',
  'Sri Lanka': 'Rs',
  'Turkey': '₺',
  'Egypt': 'EGP',
  'South Africa': 'R',
  'Nigeria': '₦',
  'Kenya': 'KSh',
  'Morocco': 'DH',
  'Brazil': 'R$',
  'Mexico': '$',
  'Argentina': '$',
  'Colombia': '$',
  'Chile': '$',
  'Russia': '₽',
  'Poland': 'zł',
  'Portugal': '€',
  'Belgium': '€',
  'Austria': '€',
  'Greece': '€',
  'Czech Republic': 'Kč',
  'Romania': 'lei',
  'Hungary': 'Ft',
  'Finland': '€',
  'Iraq': 'IQD',
  'Jordan': 'JOD',
  'Lebanon': 'LBP',
  'Afghanistan': '؋',
  'Iran': 'IRR',
  'Nepal': 'Rs',
};

const getCurrencySymbol = (countryName) => {
  return CURRENCY_SYMBOLS[countryName] || '$';
};

const QUICK_SKILLS = {
  Technology: ['React Native', 'Node.js', 'Python', 'React.js', 'SQL', 'TypeScript', 'Docker', 'AWS'],
  Design: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Illustrator', 'Prototyping', 'Branding'],
  Marketing: ['SEO', 'Google Ads', 'Content Writing', 'Copywriting', 'Social Media', 'Email Campaigns'],
  Finance: ['Accounting', 'Financial Analysis', 'Excel', 'Bookkeeping', 'QuickBooks', 'Tax Planning'],
  Education: ['Curriculum Design', 'Tutoring', 'E-Learning', 'Public Speaking', 'Lesson Planning'],
  Healthcare: ['Nursing', 'Medical Writing', 'Patient Care', 'Healthcare Admin', 'Diagnostics'],
  Engineering: ['SolidWorks', 'CAD', 'MATLAB', 'Project Management', 'Circuit Design', 'Structural Analysis'],
  Sales: ['Cold Calling', 'Negotiation', 'CRM/Salesforce', 'Lead Generation', 'B2B Sales', 'Closing Deals'],
  Legal: ['Contract Drafting', 'Legal Research', 'Litigation', 'Compliance', 'Intellectual Property'],
  HR: ['Recruiting', 'Onboarding', 'Conflict Resolution', 'HRIS Systems', 'Talent Management'],
  Media: ['Video Editing', 'Photography', 'Audio Production', 'Copywriting', 'Premiere Pro', 'Journalism'],
  Hospitality: ['Event Planning', 'Customer Service', 'Food Safety', 'Hotel Management', 'Culinary Arts'],
  Construction: ['Blueprints', 'Site Safety/OSHA', 'Project Estimation', 'Subcontracting', 'AutoCAD'],
  Logistics: ['Supply Chain', 'Inventory Control', 'SAP ERP', 'Warehouse Operations', 'Fleet Management'],
  'Customer Support': ['Zendesk', 'Live Chat', 'Ticket Resolution', 'Empathy', 'Active Listening', 'Phone Support'],
  Administration: ['Data Entry', 'Scheduling', 'Office Operations', 'Google Workspace', 'Minute Taking'],
  Accounting: ['General Ledger', 'Tax Auditing', 'QuickBooks', 'Accounts Payable', 'Financial Statements'],
  'Real Estate': ['Property Showings', 'MLS Database', 'Client Relations', 'Leasing Agreements', 'Market Analysis'],
  Retail: ['Merchandising', 'Point of Sale (POS)', 'Cash Handling', 'Loss Prevention', 'Store Displays'],
  Manufacturing: ['Quality Control', 'Lean Six Sigma', 'Assembly Line', 'Machine Operation', 'Supply Chain'],
  Agriculture: ['Crop Management', 'Irrigation Systems', 'Greenhouse Tech', 'Soil Science', 'Farm Operations'],
  Security: ['Access Control', 'Cybersecurity', 'Surveillance', 'Risk Assessment', 'Incident Reporting'],
  Government: ['Public Policy', 'Grant Writing', 'Public Relations', 'Civic Engagement', 'Regulatory Compliance'],
  'Non-Profit': ['Fundraising', 'Volunteer Management', 'Donor Relations', 'Community Outreach', 'Campaigns'],
  Research: ['Data Analysis', 'Laboratory Work', 'Grant Applications', 'Scientific Writing', 'Statistics'],
  Freelance: ['Time Management', 'Self-Marketing', 'Invoicing', 'Client Relations', 'Proposal Writing'],
  Internship: ['Eagerness to Learn', 'Team Collaboration', 'MS Office', 'Organization', 'Communication'],
};

function PostJobSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0.3)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, { toValue: 0.85, duration: 750, easing: Easing.linear, useNativeDriver: true }),
        Animated.timing(shimmerAnim, { toValue: 0.3, duration: 750, easing: Easing.linear, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const Block = ({ w, h, mb = 0, br = 6 }) => (
    <Animated.View style={{ width: w, height: h, backgroundColor: '#E5E7EB', borderRadius: br, marginBottom: mb, opacity: shimmerAnim }} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#D4EAD7' }}>
      <View style={{ paddingHorizontal: 20, paddingTop: insets.top > 0 ? insets.top + 12 : 56, paddingBottom: 12 }}>
        <Block w={160} h={26} mb={6} />
        <Block w={240} h={14} />
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ marginBottom: 16 }}>
            <Block w={100} h={12} mb={8} />
            <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, height: 52, paddingHorizontal: 16, justifyContent: 'center' }}>
              <Block w='80%' h={14} />
            </View>
          </View>
        ))}
        <Block w={80} h={12} mb={10} />
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 20 }}>
          {[90, 80, 70, 90].map((w, i) => (
            <Block key={i} w={w} h={36} br={20} />
          ))}
        </View>
        <Block w={100} h={12} mb={8} />
        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, height: 100, padding: 16 }}>
          <Block w='90%' h={12} mb={8} />
          <Block w='70%' h={12} mb={8} />
          <Block w='80%' h={12} />
        </View>
        <Animated.View style={{ backgroundColor: '#E8F542', borderRadius: 18, height: 58, marginTop: 24, opacity: shimmerAnim }} />
      </ScrollView>
    </View>
  );
}

export default function PostJobScreen({ navigation }) {
  const { t } = useTranslation();
  const { postJob, user } = useAuth();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');

  // Country & City States
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [selectedCity, setSelectedCity] = useState(COUNTRIES[0].cities[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);

  // Budget/Salary States (Strictly in Dollars USD)
  const [salaryType, setSalaryType] = useState('Per Month'); // 'Per Hour' | 'Per Day' | 'Per Week' | 'Per Month'
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');

  // Dropdown options
  const [selectedType, setSelectedType] = useState('Full Time');
  const [selectedCategory, setSelectedCategory] = useState('Technology');
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');

  // Description & Requirements
  const [description, setDescription] = useState('');
  const [customRequirement, setCustomRequirement] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const [loading, setLoading] = useState(false);
  const [posted, setPosted] = useState(false);
  const [screenLoading, setScreenLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setScreenLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Update city if country changes
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSelectedCity(country.cities[0]);
    setShowCountryModal(false);
  };

  const handleAddSkill = (skill) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleRemoveSkill = (skill) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleAddCustomRequirement = () => {
    if (customRequirement.trim()) {
      if (!selectedSkills.includes(customRequirement.trim())) {
        setSelectedSkills([...selectedSkills, customRequirement.trim()]);
      }
      setCustomRequirement('');
    }
  };

  const handlePost = async () => {
    if (!title.trim() || !company.trim() || !salaryMin.trim() || !salaryMax.trim() || !description.trim()) {
      Alert.alert('Missing Details', 'Please fill in all required fields to post the job.');
      return;
    }

    if (description.trim().length < 30) {
      Alert.alert('Description Too Short', 'Please enter a detailed description of at least 30 characters to attract premium candidates.');
      return;
    }

    setLoading(true);

    const formattedLocation = `${selectedCity}, ${selectedCountry.name}`;
    const currencySymbol = getCurrencySymbol(selectedCountry.name);
    let suffix = '/mo';
    if (salaryType === 'Per Hour') suffix = '/hr';
    if (salaryType === 'Per Day') suffix = '/day';
    if (salaryType === 'Per Week') suffix = '/wk';
    if (salaryType === 'Per Month') suffix = '/mo';

    const formattedSalary = `${currencySymbol}${salaryMin}-${currencySymbol}${salaryMax}${suffix}`;

    const finalRequirements = selectedSkills.length > 0
      ? selectedSkills
      : ['2+ years experience in the field', 'Strong professional standards', 'Good coordination skills'];

    try {
      const result = await postJob({
        title: title.trim(),
        company: company.trim(),
        location: formattedLocation,
        salary: formattedSalary,
        type: selectedType,
        category: selectedCategory,
        description: `[Experience: ${experienceLevel}]\n\n${description.trim()}`,
        requirements: finalRequirements
      });

      if (result?.success) {
        setPosted(true);
      } else {
        Alert.alert('Post Failed', result?.message || 'Something went wrong while posting the job. Please try again.');
      }
    } catch (err) {
      Alert.alert('Post Failed', 'A network or system error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setCompany('');
    setSelectedCountry(COUNTRIES[0]);
    setSelectedCity(COUNTRIES[0].cities[0]);
    setSalaryType('Per Month');
    setSalaryMin('');
    setSalaryMax('');
    setSelectedType('Full Time');
    setSelectedCategory('Technology');
    setExperienceLevel('Intermediate');
    setDescription('');
    setCustomRequirement('');
    setSelectedSkills([]);
    setPosted(false);
  };

  if (screenLoading) return <PostJobSkeleton />;

  if (loading) {
    return (
      <Modal visible={true} transparent={false} animationType="fade" statusBarTranslucent={true}>
        <SplashScreen 
          message="Uploading job details..." 
          subMessage="Publishing your premium opportunity dynamically" 
          showLottie={true} 
        />
      </Modal>
    );
  }

  if (posted) {
    return (
      <View style={styles.successContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <LottieView
              source={require('../../assets/success.lottie')}
              style={{ width: 240, height: 240 }}
              autoPlay
              loop={false}
            />
          </View>
          <Text style={styles.successTitle}>Job Posted Live!</Text>
          <Text style={styles.successSub}>Your premium job listing has been verified and is now live for global candidate discovery.</Text>

          <TouchableOpacity style={styles.postAnotherBtn} onPress={handleReset} activeOpacity={0.88}>
            <Text style={styles.postAnotherBtnText}>Post Another Listing</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (user && !user.phone) {
    return (
      <View style={styles.blockedContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
        <View style={styles.blockedCard}>
          <View style={styles.blockedIconCircle}>
            <Ionicons name="call-outline" size={44} color="#B91C1C" />
          </View>
          <Text style={styles.blockedTitle}>Phone Number Required</Text>
          <Text style={styles.blockedSub}>
            To maintain a professional and authentic job marketplace, BKJ requires all employers to have a valid phone number before posting job opportunities.
          </Text>
          
          <TouchableOpacity
            style={styles.blockedBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.88}
          >
            <Text style={styles.blockedBtnText}>Add Phone Number Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#1A1A1A" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.bgPrimary} />
      <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top > 0 ? insets.top : 16 }]} showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('post_job.post_job_title')}</Text>
          <Text style={styles.headerSub}>{t('post_job.post_job_subtitle')}</Text>
        </View>

        <View style={styles.card}>
          {/* Job Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.job_title_label')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="briefcase-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Senior React Native Developer"
                placeholderTextColor={COLORS.textLight}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Company */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.company_name_label')}</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={18} color={COLORS.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. TechCorp Solutions"
                placeholderTextColor={COLORS.textLight}
                value={company}
                onChangeText={setCompany}
              />
            </View>
          </View>

          {/* Country Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.country_label')}</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              activeOpacity={0.8}
              onPress={() => setShowCountryModal(true)}
            >
              <View style={styles.dropdownLeft}>
                <Text style={styles.flagText}>{selectedCountry.flag}</Text>
                <Text style={styles.dropdownText}>{selectedCountry.name}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* City Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.city_label')}</Text>
            <TouchableOpacity
              style={styles.dropdownTrigger}
              activeOpacity={0.8}
              onPress={() => setShowCityModal(true)}
            >
              <View style={styles.dropdownLeft}>
                <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 8 }} />
                <Text style={styles.dropdownText}>{selectedCity}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Budget/Salary Type Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.salary_type_label')}</Text>
            <View style={styles.selectorTabs}>
              {['Per Hour', 'Per Day', 'Per Week', 'Per Month'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.selectorTabBtn, salaryType === type && styles.selectorTabBtnActive]}
                  onPress={() => setSalaryType(type)}
                >
                  <Text style={[styles.selectorTabText, salaryType === type && styles.selectorTabTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Salary Amount Range */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.salary_range_label')} ({getCurrencySymbol(selectedCountry.name)}) *</Text>
            <View style={styles.salaryInputRow}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.currencySymbol}>{getCurrencySymbol(selectedCountry.name)}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Min"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textLight}
                  value={salaryMin}
                  onChangeText={setSalaryMin}
                />
              </View>
              <Text style={styles.salarySeparator}>to</Text>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.currencySymbol}>{getCurrencySymbol(selectedCountry.name)}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Max"
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.textLight}
                  value={salaryMax}
                  onChangeText={setSalaryMax}
                />
              </View>
              <Text style={styles.salaryUnit}>
                {salaryType === 'Per Hour' ? '/hr' : salaryType === 'Per Day' ? '/day' : salaryType === 'Per Week' ? '/wk' : '/mo'}
              </Text>
            </View>
          </View>

          {/* Job Type Options */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.job_type_label')}</Text>
            <View style={styles.chipsRow}>
              {JOB_TYPES.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, selectedType === t && styles.chipActive]}
                  onPress={() => setSelectedType(t)}
                >
                  <Text style={[styles.chipText, selectedType === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Experience Levels */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.experience_label')}</Text>
            <View style={styles.chipsRow}>
              {EXPERIENCE_LEVELS.map((exp) => (
                <TouchableOpacity
                  key={exp}
                  style={[styles.chip, experienceLevel === exp && styles.chipActive]}
                  onPress={() => setExperienceLevel(exp)}
                >
                  <Text style={[styles.chipText, experienceLevel === exp && styles.chipTextActive]}>{exp}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sector / Category Options */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.category_label')}</Text>
            <View style={styles.chipsRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, selectedCategory === c && styles.chipActive]}
                  onPress={() => setSelectedCategory(c)}
                >
                  <Text style={[styles.chipText, selectedCategory === c && styles.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Skill Tags / Requirements */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('post_job.skills_label')}</Text>

            {/* Quick Skills list based on category */}
            <Text style={styles.skillHintText}>Add recommended skills for {selectedCategory}:</Text>
            <View style={[styles.chipsRow, { marginBottom: 12 }]}>
              {QUICK_SKILLS[selectedCategory]?.map((skill) => (
                <TouchableOpacity
                  key={skill}
                  style={[
                    styles.skillAddBtn,
                    selectedSkills.includes(skill) && styles.skillAddBtnDisabled
                  ]}
                  onPress={() => handleAddSkill(skill)}
                  disabled={selectedSkills.includes(skill)}
                >
                  <Text style={styles.skillAddBtnText}>+ {skill}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Custom skill input */}
            <View style={styles.skillInputWrapper}>
              <TextInput
                style={styles.skillInput}
                placeholder="Enter custom requirement/skill..."
                placeholderTextColor={COLORS.textLight}
                value={customRequirement}
                onChangeText={setCustomRequirement}
              />
              <TouchableOpacity style={styles.skillAddIconButton} onPress={handleAddCustomRequirement}>
                <Ionicons name="add" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            </View>

            {/* Selected Skills/Requirements Tags */}
            {selectedSkills.length > 0 && (
              <View style={[styles.chipsRow, { marginTop: 12 }]}>
                {selectedSkills.map((skill) => (
                  <View key={skill} style={styles.activeSkillTag}>
                    <Text style={styles.activeSkillText}>{skill}</Text>
                    <TouchableOpacity onPress={() => handleRemoveSkill(skill)} style={{ marginLeft: 6 }}>
                      <Ionicons name="close-circle" size={16} color="#B91C1C" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Description with Char Counter */}
          <View style={styles.inputGroup}>
            <View style={styles.descriptionHeaderRow}>
              <Text style={styles.label}>{t('post_job.description_label')}</Text>
              <Text style={[
                styles.charCounter,
                description.length >= 30 ? { color: '#059669' } : { color: '#DC2626' }
              ]}>
                {description.length} / 30 chars min
              </Text>
            </View>
            <View style={[styles.inputWrapper, { height: 140, alignItems: 'flex-start', paddingVertical: 14 }]}>
              <TextInput
                style={[styles.input, { textAlignVertical: 'top' }]}
                placeholder="Describe details, roles, expectations, hours, timings and company goals..."
                placeholderTextColor={COLORS.textLight}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={5}
              />
            </View>
          </View>

          {/* Publish CTA Button */}
          <TouchableOpacity style={styles.postBtn} onPress={handlePost} activeOpacity={0.88}>
            <Ionicons name="cloud-upload" size={18} color={COLORS.textWhite} style={{ marginRight: 8 }} />
            <Text style={styles.postBtnText}>{loading ? 'Uploading...' : 'Publish Listing'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Selection Modal */}
      <Modal visible={showCountryModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={() => setShowCountryModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.modalItemFlag}>{item.flag}</Text>
                  <Text style={styles.modalItemText}>{item.name}</Text>
                  {selectedCountry.name === item.name && (
                    <Ionicons name="checkmark" size={20} color={COLORS.accentGreen} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* City Selection Modal */}
      <Modal visible={showCityModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalDismissArea} activeOpacity={1} onPress={() => setShowCityModal(false)} />
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select City / Region in {selectedCountry.name}</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={selectedCountry.cities}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setSelectedCity(item);
                    setShowCityModal(false);
                  }}
                >
                  <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} style={{ marginRight: 12 }} />
                  <Text style={styles.modalItemText}>{item}</Text>
                  {selectedCity === item && (
                    <Ionicons name="checkmark" size={20} color={COLORS.accentGreen} style={{ marginLeft: 'auto' }} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  scroll: { paddingHorizontal: 20, paddingBottom: 150, paddingTop: 0 },

  header: { paddingTop: 12, paddingBottom: 20, paddingHorizontal: 2 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5 },
  headerSub: { fontSize: FONTS.sizes.xs + 1, color: COLORS.textSecondary, marginTop: 2 },

  card: {
    backgroundColor: COLORS.bgCard, borderRadius: 28, padding: 22,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowOpacity: 0.06, shadowRadius: 18, elevation: 0,
  },

  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8, paddingLeft: 2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAF9', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#EEF2F0',
    paddingHorizontal: 16, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: FONTS.sizes.md, color: COLORS.textPrimary, fontWeight: '500' },

  dropdownTrigger: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAF9', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#EEF2F0',
    paddingHorizontal: 16, height: 52,
  },
  dropdownLeft: { flexDirection: 'row', alignItems: 'center' },
  flagText: { fontSize: 18, marginRight: 10 },
  dropdownText: { fontSize: FONTS.sizes.md, color: COLORS.textPrimary, fontWeight: '600' },

  selectorTabs: { flexDirection: 'row', backgroundColor: '#EEF2F0', borderRadius: 14, padding: 4 },
  selectorTabBtn: { flex: 1, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  selectorTabBtnActive: { backgroundColor: '#111111' },
  selectorTabText: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary },
  selectorTabTextActive: { color: COLORS.textWhite },

  salaryInputRow: { flexDirection: 'row', alignItems: 'center' },
  currencySymbol: { fontSize: FONTS.sizes.md, fontWeight: '700', color: COLORS.textSecondary, marginRight: 4 },
  salarySeparator: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginHorizontal: 10 },
  salaryUnit: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary, marginLeft: 10 },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F8FAF9',
    borderWidth: 1.5, borderColor: '#EEF2F0',
  },
  chipActive: { backgroundColor: COLORS.accentYellow, borderColor: COLORS.accentYellowDark },
  chipText: { fontSize: FONTS.sizes.xs, fontWeight: '700', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.textPrimary },

  skillHintText: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600', marginBottom: 6, paddingLeft: 2 },
  skillAddBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
    backgroundColor: '#EBF7EC', borderWidth: 1, borderColor: '#D4EAD7',
  },
  skillAddBtnDisabled: {
    backgroundColor: '#F3F5F4', borderColor: '#EEF2F0', opacity: 0.5,
  },
  skillAddBtnText: { fontSize: 11, fontWeight: '700', color: '#15803D' },

  skillInputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8FAF9', borderRadius: 16,
    borderWidth: 1.5, borderColor: '#EEF2F0',
    paddingLeft: 16, paddingRight: 6, height: 52,
  },
  skillInput: { flex: 1, fontSize: 13, color: COLORS.textPrimary, fontWeight: '500' },
  skillAddIconButton: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: '#111111', alignItems: 'center', justifyContent: 'center',
  },

  activeSkillTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#EEF2F0', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  activeSkillText: { fontSize: 11, fontWeight: '700', color: COLORS.textPrimary },

  descriptionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  charCounter: { fontSize: 11, fontWeight: '700' },

  postBtn: {
    backgroundColor: '#111111',
    borderRadius: 26, height: 54,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 0,
  },
  postBtnText: { fontSize: FONTS.sizes.md + 1, fontWeight: '800', color: COLORS.textWhite },

  successContainer: { flex: 1, backgroundColor: COLORS.bgPrimary, justifyContent: 'center', padding: 20 },
  successCard: {
    backgroundColor: COLORS.bgCard, borderRadius: 28, padding: 36, alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 18, elevation: 0,
  },
  successIcon: { marginBottom: 12 },
  successTitle: { fontSize: 24, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.5, marginBottom: 8 },
  successSub: { fontSize: FONTS.sizes.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  postAnotherBtn: {
    backgroundColor: '#111111', borderRadius: 26, height: 52,
    paddingHorizontal: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 0,
  },
  postAnotherBtnText: { fontSize: FONTS.sizes.sm + 1, fontWeight: '800', color: COLORS.textWhite },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: COLORS.bgCard,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '65%',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginVertical: 10,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F0',
  },
  modalItemFlag: {
    fontSize: 22,
    marginRight: 14,
  },
  modalItemText: {
    fontSize: FONTS.sizes.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  blockedContainer: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    justifyContent: 'center',
    padding: 24,
  },
  blockedCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 28,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 18,
    elevation: 2,
  },
  blockedIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  blockedTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 8,
    textAlign: 'center',
  },
  blockedSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  blockedBtn: {
    backgroundColor: COLORS.accentYellow,
    borderRadius: 24,
    height: 52,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: COLORS.accentYellow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  blockedBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
});
