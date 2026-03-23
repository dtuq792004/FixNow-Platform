import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ApplicationStatusCard } from '~/features/provider/components/application-status-card';
import { ApplicationTimeline } from '~/features/provider/components/application-timeline';
import { useProviderApplication } from '~/features/provider/hooks/use-provider-application';
import { getCategoryConfig } from '~/features/home/data/service-categories';

// ── Rejection notice ──────────────────────────────────────────────────────────
const RejectionNotice = ({ reason }: { reason: string }) => (
  <View style={{
    backgroundColor: '#FFF5F5', borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#FECACA', flexDirection: 'row', gap: 10,
  }}>
    <Feather name="alert-circle" size={16} color="#DC2626" style={{ marginTop: 1, flexShrink: 0 }} />
    <View style={{ flex: 1 }}>
      <RNText style={{ fontSize: 13, fontWeight: '700', color: '#DC2626', marginBottom: 4 }}>
        Lý do không được chấp thuận
      </RNText>
      <RNText style={{ fontSize: 12, color: '#7F1D1D', lineHeight: 18 }}>{reason}</RNText>
    </View>
  </View>
);

// ── Approval notice ───────────────────────────────────────────────────────────
const ApprovalNotice = () => (
  <View style={{
    backgroundColor: '#ECFDF5', borderRadius: 12, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: '#A7F3D0', flexDirection: 'row', gap: 10,
  }}>
    <Feather name="check-circle" size={16} color="#059669" style={{ marginTop: 1, flexShrink: 0 }} />
    <View style={{ flex: 1 }}>
      <RNText style={{ fontSize: 13, fontWeight: '700', color: '#059669', marginBottom: 4 }}>
        Tài khoản thợ đã được kích hoạt
      </RNText>
      <RNText style={{ fontSize: 12, color: '#064E3B', lineHeight: 18 }}>
        Bạn có thể bắt đầu nhận việc ngay trong mục "Công việc". Hãy hoàn thiện hồ sơ để thu hút nhiều đơn hàng hơn!
      </RNText>
    </View>
  </View>
);

// ── Application detail section ────────────────────────────────────────────────
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={{
    flexDirection: 'row', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F4F4F5',
  }}>
    <RNText style={{ fontSize: 13, color: '#71717A', width: 130 }}>{label}</RNText>
    <RNText style={{ fontSize: 13, color: '#18181B', fontWeight: '500', flex: 1 }}>{value}</RNText>
  </View>
);

// ── Screen ────────────────────────────────────────────────────────────────────
const ApplicationStatusScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { application } = useProviderApplication();

  // Guard: no application yet → redirect to register
  if (!application) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Feather name="file-text" size={40} color="#D4D4D8" />
        <RNText style={{ fontSize: 16, fontWeight: '700', color: '#18181B', marginTop: 14, marginBottom: 8 }}>
          Chưa có đơn đăng ký
        </RNText>
        <RNText style={{ fontSize: 13, color: '#71717A', textAlign: 'center', marginBottom: 24 }}>
          Bạn chưa nộp đơn đăng ký làm thợ kỹ thuật.
        </RNText>
        <Pressable
          onPress={() => router.replace('/become-provider/register')}
          style={{ backgroundColor: '#18181B', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 }}
        >
          <RNText style={{ color: '#fff', fontWeight: '700' }}>Đăng ký ngay</RNText>
        </Pressable>
      </View>
    );
  }

  const specialtyLabels = application.specialties
    .map((s) => getCategoryConfig(s).label)
    .join(', ');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8, paddingBottom: 14,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#F4F4F5',
      }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <RNText style={{ fontSize: 17, fontWeight: '700', color: '#18181b' }}>
            Trạng thái đơn đăng ký
          </RNText>
          <RNText style={{ fontSize: 12, color: '#a1a1aa', marginTop: 1 }}>
            Mã đơn: {application.id}
          </RNText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Status card */}
        <ApplicationStatusCard
          status={application.status}
          submittedAt={application.submitted_at}
          reviewedAt={application.reviewed_at}
        />

        {/* Conditional notices */}
        {application.status === 'rejected' && application.rejectionReason && (
          <RejectionNotice reason={application.rejectionReason} />
        )}
        {application.status === 'approved' && <ApprovalNotice />}

        {/* Timeline */}
        <RNText style={{
          fontSize: 14, fontWeight: '700', color: '#18181B', marginBottom: 14,
        }}>
          Tiến trình xét duyệt
        </RNText>
        <ApplicationTimeline
          status={application.status}
          submittedAt={application.submitted_at}
        />

        {/* Application summary */}
        <View style={{
          marginTop: 28, borderWidth: 1, borderColor: '#E4E4E7',
          borderRadius: 14, overflow: 'hidden',
        }}>
          <View style={{ backgroundColor: '#F9F9F9', paddingHorizontal: 14, paddingVertical: 10 }}>
            <RNText style={{ fontSize: 12, fontWeight: '700', color: '#71717A', letterSpacing: 0.4 }}>
              THÔNG TIN ĐƠN ĐĂNG KÝ
            </RNText>
          </View>
          <View style={{ paddingHorizontal: 14 }}>
            <DetailRow label="Họ và tên"       value={application.fullName} />
            <DetailRow label="Số điện thoại"   value={application.phone || '—'} />
            <DetailRow label="Chuyên môn"       value={specialtyLabels} />
            <DetailRow label="Khu vực"          value={application.serviceArea} />
            <DetailRow label="Kinh nghiệm"      value={application.experience} />
            <DetailRow label="CCCD/CMND"        value={`***${application.idCard.slice(-4)}`} />
            {application.motivation ? (
              <DetailRow label="Lý do đăng ký"  value={application.motivation} />
            ) : null}
          </View>
        </View>

        {/* Re-apply CTA (only if rejected) */}
        {application.status === 'rejected' && (
          <Pressable
            onPress={() => router.replace('/become-provider/register')}
            style={{
              marginTop: 24, height: 52, borderRadius: 14,
              borderWidth: 1.5, borderColor: '#18181B',
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Feather name="refresh-cw" size={15} color="#18181b" />
            <RNText style={{ fontSize: 15, fontWeight: '700', color: '#18181B' }}>
              Nộp đơn lại
            </RNText>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
};

export default ApplicationStatusScreen;
