import React from 'react';
import { View, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import { Button } from './Button';

export type SyncStatus = 'all' | 'synced' | 'pending';

interface SyncStatusButtonsProps {
  selectedStatus: SyncStatus;
  onStatusChange: (status: SyncStatus) => void;
}

const SyncStatusButtons: React.FC<SyncStatusButtonsProps> = ({
  selectedStatus,
  onStatusChange,
}) => {
  const buttons: { id: SyncStatus; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'synced', label: 'Synced' },
    { id: 'pending', label: 'Pending' },
  ];

  return (
    <View style={styles.container}>
      {buttons.map(button => {
        const isActive = selectedStatus === button.id;
        return (
          <Button
            key={button.id}
            title={button.label}
            onPress={() => onStatusChange(button.id)}
            variant={isActive ? 'primary' : 'tertiary'}
            size="small"
            style={styles.button}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: 4,
    gap: 4,
    flex: 1,
    maxWidth: 300,
    alignSelf: 'center',
  },
  button: {
    flex: 1,
  },
});

export default SyncStatusButtons;
