import BatteryStorageHero from '@/components/battery-storage/BatteryStorageHero'
import BatteryStorageRevenue from '@/components/battery-storage/BatteryStorageRevenue'
import BatteryStorageFeatures from '@/components/battery-storage/BatteryStorageFeatures'
import BatteryStorageGridServices from '@/components/battery-storage/BatteryStorageGridServices'
import BatteryStoragePredictableReturns from '@/components/battery-storage/BatteryStoragePredictableReturns'
import BatteryStorageLandLease from '@/components/battery-storage/BatteryStorageLandLease'
import BatteryStorageCTA from '@/components/battery-storage/BatteryStorageCTA'

const BatteryStoragePage = () => {
  return (
    <div>
      <BatteryStorageHero />
      <BatteryStorageRevenue />
      <BatteryStorageFeatures />
      <BatteryStorageGridServices />
      <BatteryStoragePredictableReturns />
      <BatteryStorageLandLease />
      <BatteryStorageCTA />
    </div>
  )
}

export default BatteryStoragePage
