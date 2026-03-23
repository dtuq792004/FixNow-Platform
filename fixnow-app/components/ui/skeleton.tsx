import { cn } from '~/lib/utils';
import { Platform, View } from 'react-native';

function Skeleton({
  className,
  ...props
}: React.ComponentProps<typeof View> & React.RefAttributes<View>) {
  return (
    <View
      className={cn(
        'bg-accent rounded-md',
        Platform.select({ web: 'animate-pulse' }),
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
