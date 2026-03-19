/**
 * DatePicker — Native date selector
 *
 * Shows a calendar-style month/day picker inline.
 * No external dependencies — pure React Native.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../theme';

interface DatePickerProps {
  value: string;
  onChange: (dateStr: string) => void;
  placeholder?: string;
  minDate?: Date;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_SHORT = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function DatePicker({ value, onChange, placeholder = 'Select date', minDate }: DatePickerProps) {
  const [visible, setVisible] = useState(false);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const min = minDate || today;

  function handleSelect(day: number) {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${m}-${d}`;
    const display = `${day} ${MONTHS[viewMonth]} ${viewYear}`;
    onChange(display);
    setVisible(false);
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  function isDisabled(day: number): boolean {
    const date = new Date(viewYear, viewMonth, day);
    return date < new Date(min.getFullYear(), min.getMonth(), min.getDate());
  }

  // Build calendar grid
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={() => setVisible(true)} activeOpacity={0.7}>
        <Ionicons name="calendar-outline" size={18} color={value ? colors.shared.gold : colors.hub.textMuted} />
        <Text style={[styles.triggerText, !value && styles.triggerPlaceholder]}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.calendar}>
            {/* Month/Year Header */}
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
                <Ionicons name="chevron-back" size={20} color={colors.hub.text} />
              </TouchableOpacity>
              <Text style={styles.calTitle}>{MONTHS[viewMonth]} {viewYear}</Text>
              <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
                <Ionicons name="chevron-forward" size={20} color={colors.hub.text} />
              </TouchableOpacity>
            </View>

            {/* Day Headers */}
            <View style={styles.dayHeaders}>
              {DAYS_SHORT.map((d) => (
                <Text key={d} style={styles.dayHeader}>{d}</Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {cells.map((day, i) => (
                <View key={i} style={styles.dayCell}>
                  {day ? (
                    <TouchableOpacity
                      style={[styles.dayBtn, isDisabled(day) && styles.dayDisabled]}
                      disabled={isDisabled(day)}
                      onPress={() => handleSelect(day)}
                    >
                      <Text style={[styles.dayText, isDisabled(day) && styles.dayTextDisabled]}>
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ))}
            </View>

            {/* Cancel */}
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: colors.hub.border, borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 14, backgroundColor: '#FAFAFA',
  },
  triggerText: { fontFamily: 'Montserrat-Regular', fontSize: 15, color: colors.hub.text, flex: 1 },
  triggerPlaceholder: { color: colors.hub.textMuted },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  calendar: { backgroundColor: '#fff', borderRadius: 16, padding: 20, width: '100%', maxWidth: 360 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calTitle: { fontFamily: 'Montserrat-SemiBold', fontSize: 16, color: colors.hub.text },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dayHeaders: { flexDirection: 'row' },
  dayHeader: { flex: 1, textAlign: 'center', fontFamily: 'Montserrat-SemiBold', fontSize: 12, color: colors.hub.textMuted, paddingBottom: 8 },
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: '14.28%', aspectRatio: 1, padding: 2 },
  dayBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
  dayDisabled: { opacity: 0.3 },
  dayText: { fontFamily: 'Montserrat-Medium', fontSize: 14, color: colors.hub.text },
  dayTextDisabled: { color: colors.hub.textMuted },
  cancelBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontFamily: 'Montserrat-SemiBold', fontSize: 14, color: colors.hub.textMuted },
});
