const fs = require('fs');
const path = require('path');

const jobsScreenPath = path.join(__dirname, '..', 'frontend', 'src', 'screens', 'JobsScreen.js');

if (!fs.existsSync(jobsScreenPath)) {
  console.error('JobsScreen.js not found!');
  process.exit(1);
}

let content = fs.readFileSync(jobsScreenPath, 'utf8');

// Normalize line endings to LF for matching
content = content.replace(/\r\n/g, '\n');

// 1. Reconstruct Step 634 + 680 + 682 + 684: The main hero stats card with border stack glows and underlays
const heroTarget = `        {/* 🌟 NEXT-LEVEL HERO GRADIENT STATS CARD */}
        <View style={styles.heroGradientCard}>
          <View style={styles.heroCardHeader}>
            <View style={styles.heroTagBadge}>
              <Text style={styles.heroTagText}>PREMIUM ACCESS</Text>
            </View>
            <Text style={styles.heroTitle}>{t('profile.shape_future') || 'Shape Your Professional Future 🚀'}</Text>
            <Text style={styles.heroSubText}>{t('profile.explore_postings') || 'Explore matched postings & connect directly with recruiters.'}</Text>
          </View>

          {/* Interactive Stats Grid */}
          <View style={styles.statsGridRow}>
            {/* Stat Box 1: Total Opportunities */}
            <TouchableOpacity
              style={[
                styles.statCardItem,
                (!filterLikedOnly && !filterMyJobsOnly) && styles.statCardItemActive
              ]}
              onPress={() => {
                setFilterLikedOnly(false);
                setFilterMyJobsOnly(false);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.statIconBadge}>
                <Ionicons name="briefcase" size={15} color={theme.isDark ? "#111111" : "#5C9E6A"} />
              </View>
              <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{totalJobsCount}</Text>
              <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.total_jobs') || 'Total Jobs'}</Text>
            </TouchableOpacity>

            {/* Stat Box 2: Liked / Saved Opportunities */}
            <TouchableOpacity
              style={[
                styles.statCardItem,
                filterLikedOnly && styles.statCardItemActive
              ]}
              onPress={() => {
                setFilterLikedOnly(!filterLikedOnly);
                setFilterMyJobsOnly(false);
              }}
              activeOpacity={0.85}
            >
              <View style={[styles.statIconBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                <Ionicons name="heart" size={15} color={theme.isDark ? "#111111" : "#EF4444"} />
              </View>
              <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{likedJobsCount}</Text>
              <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.saved_jobs') || 'Favorites'}</Text>
            </TouchableOpacity>

            {/* Stat Box 3: My Postings (Employer) / Verified Status (Job Seeker) */}
            {isEmployer ? (
              <TouchableOpacity
                style={[
                  styles.statCardItem,
                  filterMyJobsOnly && styles.statCardItemActive
                ]}
                onPress={() => {
                  setFilterMyJobsOnly(!filterMyJobsOnly);
                  setFilterLikedOnly(false);
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="create" size={15} color={theme.isDark ? "#111111" : "#D97706"} />
                </View>
                <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{myJobsCount}</Text>
                <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.my_posts') || 'My Posts'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.statCardItem}>
                <View style={[styles.statIconBadge, { backgroundColor: '#E6F4EA' }]}>
                  <Ionicons name="checkmark-circle" size={16} color={theme.isDark ? "#111111" : "#15803D"} />
                </View>
                <Text style={[styles.statCountVal, { fontSize: 12, color: theme.isDark ? '#111111' : '#15803D', fontWeight: '800', lineHeight: 22 }]} numberOfLines={1} adjustsFontSizeToFit>{t('profile.verified') || 'Verified'}</Text>
                <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.profile_text') || 'Profile'}</Text>
              </View>
            )}
          </View>
        </View>`;

const heroReplacement = `        {/* 🌟 NEXT-LEVEL HERO GRADIENT STATS CARD */}
        <View style={{ position: 'relative', marginBottom: 24 }}>
          {theme.isDark && (
            <>
              {/* Outer soft glow layer */}
              <View
                style={{
                  position: 'absolute',
                  top: -12,
                  left: -12,
                  right: -12,
                  bottom: -12,
                  borderRadius: 36,
                  borderWidth: 6,
                  borderColor: 'rgba(255, 140, 0, 0.03)',
                }}
                pointerEvents="none"
              />
              {/* Mid glow layer */}
              <View
                style={{
                  position: 'absolute',
                  top: -6,
                  left: -6,
                  right: -6,
                  bottom: -6,
                  borderRadius: 30,
                  borderWidth: 4,
                  borderColor: 'rgba(255, 140, 0, 0.08)',
                }}
                pointerEvents="none"
              />
              {/* Inner intense glow layer */}
              <View
                style={{
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  borderRadius: 26,
                  borderWidth: 2,
                  borderColor: 'rgba(255, 140, 0, 0.18)',
                }}
                pointerEvents="none"
              />
            </>
          )}
          <View style={[styles.heroGradientCard, { marginBottom: 0 }]}>
            <View style={styles.heroCardHeader}>
              <View style={styles.heroTagBadge}>
                <Text style={styles.heroTagText}>PREMIUM ACCESS</Text>
              </View>
              <Text style={styles.heroTitle}>{t('profile.shape_future') || 'Shape Your Professional Future 🚀'}</Text>
              <Text style={styles.heroSubText}>{t('profile.explore_postings') || 'Explore matched postings & connect directly with recruiters.'}</Text>
            </View>

            {/* Interactive Stats Grid */}
            <View style={styles.statsGridRow}>
              {/* Stat Box 1: Total Opportunities */}
              <View style={{ flex: 1, position: 'relative', backgroundColor: theme.isDark ? '#E65C00' : 'transparent', borderRadius: 16 }}>
                {theme.isDark && (
                  <>
                    {/* Outer soft glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        right: -6,
                        bottom: -6,
                        borderRadius: 22,
                        borderWidth: 4,
                        borderColor: 'rgba(255, 140, 0, 0.04)',
                      }}
                      pointerEvents="none"
                    />
                    {/* Inner intense glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: 18,
                        borderWidth: 2,
                        borderColor: 'rgba(255, 140, 0, 0.15)',
                      }}
                      pointerEvents="none"
                    />
                  </>
                )}
                <TouchableOpacity
                  style={[
                    styles.statCardItem,
                    (!filterLikedOnly && !filterMyJobsOnly) && styles.statCardItemActive
                  ]}
                  onPress={() => {
                    setFilterLikedOnly(false);
                    setFilterMyJobsOnly(false);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={styles.statIconBadge}>
                    <Ionicons name="briefcase" size={15} color={theme.isDark ? "#111111" : "#5C9E6A"} />
                  </View>
                  <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{totalJobsCount}</Text>
                  <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.total_jobs') || 'Total Jobs'}</Text>
                </TouchableOpacity>
              </View>

              {/* Stat Box 2: Liked / Saved Opportunities */}
              <View style={{ flex: 1, position: 'relative', backgroundColor: theme.isDark ? '#E65C00' : 'transparent', borderRadius: 16 }}>
                {theme.isDark && (
                  <>
                    {/* Outer soft glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        right: -6,
                        bottom: -6,
                        borderRadius: 22,
                        borderWidth: 4,
                        borderColor: 'rgba(255, 140, 0, 0.04)',
                      }}
                      pointerEvents="none"
                    />
                    {/* Inner intense glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: 18,
                        borderWidth: 2,
                        borderColor: 'rgba(255, 140, 0, 0.15)',
                      }}
                      pointerEvents="none"
                    />
                  </>
                )}
                <TouchableOpacity
                  style={[
                    styles.statCardItem,
                    filterLikedOnly && styles.statCardItemActive
                  ]}
                  onPress={() => {
                    setFilterLikedOnly(!filterLikedOnly);
                    setFilterMyJobsOnly(false);
                  }}
                  activeOpacity={0.85}
                >
                  <View style={[styles.statIconBadge, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
                    <Ionicons name="heart" size={15} color={theme.isDark ? "#111111" : "#EF4444"} />
                  </View>
                  <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{likedJobsCount}</Text>
                  <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.saved_jobs') || 'Favorites'}</Text>
                </TouchableOpacity>
              </View>

              {/* Stat Box 3: My Postings (Employer) / Verified Status (Job Seeker) */}
              <View style={{ flex: 1, position: 'relative', backgroundColor: theme.isDark ? '#E65C00' : 'transparent', borderRadius: 16 }}>
                {theme.isDark && (
                  <>
                    {/* Outer soft glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -6,
                        left: -6,
                        right: -6,
                        bottom: -6,
                        borderRadius: 22,
                        borderWidth: 4,
                        borderColor: 'rgba(255, 140, 0, 0.04)',
                      }}
                      pointerEvents="none"
                    />
                    {/* Inner intense glow */}
                    <View
                      style={{
                        position: 'absolute',
                        top: -2,
                        left: -2,
                        right: -2,
                        bottom: -2,
                        borderRadius: 18,
                        borderWidth: 2,
                        borderColor: 'rgba(255, 140, 0, 0.15)',
                      }}
                      pointerEvents="none"
                    />
                  </>
                )}
                {isEmployer ? (
                  <TouchableOpacity
                    style={[
                      styles.statCardItem,
                      filterMyJobsOnly && styles.statCardItemActive
                    ]}
                    onPress={() => {
                      setFilterMyJobsOnly(!filterMyJobsOnly);
                      setFilterLikedOnly(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.statIconBadge, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="create" size={15} color={theme.isDark ? "#111111" : "#D97706"} />
                    </View>
                    <Text style={styles.statCountVal} numberOfLines={1} adjustsFontSizeToFit>{myJobsCount}</Text>
                    <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.my_posts') || 'My Posts'}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.statCardItem}>
                    <View style={[styles.statIconBadge, { backgroundColor: '#E6F4EA' }]}>
                      <Ionicons name="checkmark-circle" size={16} color={theme.isDark ? "#111111" : "#15803D"} />
                    </View>
                    <Text style={[styles.statCountVal, { fontSize: 12, color: theme.isDark ? '#111111' : '#15803D', fontWeight: '800', lineHeight: 22 }]} numberOfLines={1} adjustsFontSizeToFit>{t('profile.verified') || 'Verified'}</Text>
                    <Text style={styles.statLabelText} numberOfLines={1} adjustsFontSizeToFit>{t('profile.profile_text') || 'Profile'}</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>`;

if (content.includes(heroTarget)) {
  content = content.replace(heroTarget, heroReplacement);
  console.log('Hero Stats Card applied successfully!');
} else {
  console.error('FAILED: Hero Stats Card target not found!');
  process.exit(1);
}

// 2. Step 620: Update statCardItem width
const statCardItemTarget = `  statCardItem: {
    flex: 1,
    width: 0,`;
const statCardItemReplacement = `  statCardItem: {
    flex: 1,
    width: '100%',`;

if (content.includes(statCardItemTarget)) {
  content = content.replace(statCardItemTarget, statCardItemReplacement);
  console.log('Step 620: statCardItem width updated successfully!');
} else {
  console.warn('Step 620 FAILED: statCardItem target not found!');
}

// 3. Step 648: nearYouBadge location icon color
const locationIconTarget = `              <View style={styles.nearYouBadge}>
                <Ionicons name="location" size={11} color="#15803D" style={{ marginRight: 3 }} />
                <Text style={styles.nearYouBadgeText}>Showing {userCountry} jobs first</Text>
              </View>`;
const locationIconReplacement = `              <View style={styles.nearYouBadge}>
                <Ionicons name="location" size={11} color={theme.isDark ? '#FF8C00' : '#15803D'} style={{ marginRight: 3 }} />
                <Text style={styles.nearYouBadgeText}>Showing {userCountry} jobs first</Text>
              </View>`;

if (content.includes(locationIconTarget)) {
  content = content.replace(locationIconTarget, locationIconReplacement);
  console.log('Step 648: Location icon color updated successfully!');
} else {
  console.warn('Step 648 FAILED: Location icon target not found!');
}

// 4. Step 654: specChip color theme conditional
const specChipTarget = `          <View style={[styles.specChip, { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7', borderWidth: 1 }]}>
            <Ionicons name="wallet-outline" size={14} color="#15803D" style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: '#15803D' }]}>{job.salary}</Text>
          </View>
          
          <View style={[styles.specChip, { backgroundColor: '#EFF6FF', borderColor: '#DBEAFE', borderWidth: 1 }]}>
            <Ionicons name="briefcase-outline" size={14} color="#1D4ED8" style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: '#1D4ED8' }]}>{job.type}</Text>
          </View>

          <View style={[styles.specChip, { backgroundColor: '#F5F3FF', borderColor: '#EDE9FE', borderWidth: 1 }]}>
            <Ionicons name="school-outline" size={14} color="#6D28D9" style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: '#6D28D9' }]}>{experienceReq}</Text>
          </View>`;

const specChipReplacement = `          <View style={[styles.specChip, { backgroundColor: theme.isDark ? 'rgba(255, 140, 0, 0.15)' : '#F0FDF4', borderColor: theme.isDark ? 'rgba(255, 140, 0, 0.4)' : '#DCFCE7', borderWidth: 1 }]}>
            <Ionicons name="wallet-outline" size={14} color={theme.isDark ? '#FF8C00' : '#15803D'} style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: theme.isDark ? '#FF8C00' : '#15803D' }]}>{job.salary}</Text>
          </View>
          
          <View style={[styles.specChip, { backgroundColor: theme.isDark ? 'rgba(59, 130, 246, 0.15)' : '#EFF6FF', borderColor: theme.isDark ? 'rgba(59, 130, 246, 0.4)' : '#DBEAFE', borderWidth: 1 }]}>
            <Ionicons name="briefcase-outline" size={14} color={theme.isDark ? '#60A5FA' : '#1D4ED8'} style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: theme.isDark ? '#60A5FA' : '#1D4ED8' }]}>{job.type}</Text>
          </View>

          <View style={[styles.specChip, { backgroundColor: theme.isDark ? 'rgba(139, 92, 246, 0.15)' : '#F5F3FF', borderColor: theme.isDark ? 'rgba(139, 92, 246, 0.4)' : '#EDE9FE', borderWidth: 1 }]}>
            <Ionicons name="school-outline" size={14} color={theme.isDark ? '#A78BFA' : '#6D28D9'} style={{ marginRight: 6 }} />
            <Text style={[styles.specChipText, { color: theme.isDark ? '#A78BFA' : '#6D28D9' }]}>{experienceReq}</Text>
          </View>`;

if (content.includes(specChipTarget)) {
  content = content.replace(specChipTarget, specChipReplacement);
  console.log('Step 654: Spec chips theme colors updated successfully!');
} else {
  console.warn('Step 654 FAILED: Spec chip target not found!');
}

// 5. Step 658: nearYouBadge styling updates
const nearYouBadgeTarget = `  nearYouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  nearYouBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
  },`;

const nearYouBadgeReplacement = `  nearYouBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: theme.isDark ? 'rgba(255, 140, 0, 0.15)' : '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: theme.isDark ? 'rgba(255, 140, 0, 0.4)' : '#BBF7D0',
  },
  nearYouBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.isDark ? '#FF8C00' : '#15803D',
  },`;

if (content.includes(nearYouBadgeTarget)) {
  content = content.replace(nearYouBadgeTarget, nearYouBadgeReplacement);
  console.log('Step 658: nearYouBadge style updated successfully!');
} else {
  console.warn('Step 658 FAILED: nearYouBadge target not found!');
}

// 6. Step 664: salaryBadgeContainer styling updates
const salaryBadgeTarget = `  salaryBadgeContainer: {
    backgroundColor: '#E6F4EA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 8,
  },
  jobRowSalaryText: {
    color: '#137333',
    fontSize: 11,
    fontWeight: '800',
  },`;

const salaryBadgeReplacement = `  salaryBadgeContainer: {
    backgroundColor: theme.isDark ? 'rgba(255, 140, 0, 0.15)' : '#E6F4EA',
    borderColor: theme.isDark ? 'rgba(255, 140, 0, 0.4)' : 'transparent',
    borderWidth: theme.isDark ? 1 : 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    marginLeft: 8,
  },
  jobRowSalaryText: {
    color: theme.isDark ? '#FF8C00' : '#137333',
    fontSize: 11,
    fontWeight: '800',
  },`;

if (content.includes(salaryBadgeTarget)) {
  content = content.replace(salaryBadgeTarget, salaryBadgeReplacement);
  console.log('Step 664: Salary badge style updated successfully!');
} else {
  console.warn('Step 664 FAILED: Salary badge target not found!');
}

fs.writeFileSync(jobsScreenPath, content, 'utf8');
console.log('JobsScreen.js successfully restored!');
