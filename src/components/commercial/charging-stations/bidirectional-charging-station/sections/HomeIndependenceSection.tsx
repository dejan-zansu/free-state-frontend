import HomeIndependenceSectionBase from '@/components/charging-stations/bidirectional-charging-station/sections/HomeIndependenceSectionBase'

const HomeIndependenceSection = () => (
  <HomeIndependenceSectionBase
    cardGradient="linear-gradient(180deg, rgba(59, 46, 88, 1) 47%, rgba(31, 25, 41, 1) 100%)"
    glowColor="rgba(228, 198, 255, 0.5)"
    evBatteryImage="/images/bidirectional-charging/ev-battery.png"
    homeBatteryImage="/images/bidirectional-charging/home-battery.png"
  />
)

export default HomeIndependenceSection
