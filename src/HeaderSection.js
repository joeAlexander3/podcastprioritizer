import React from "react"

const HeaderSection = () => {
  return (
    <header>
      <h1><i className="fas fa-headphones" aria-label="Icon of headphones"></i> Podcast Prioritizer</h1>
      <p>Can't decide which podcast to listen to on your next journey? Not sure whether you should walk, bike or drive? Input your <span>Starting Point</span>, <span>Destination</span>, and a <span>Podcast Search</span> term. Click/tap on a podcast to determine which how you should get to your destination and listen to your podcast in that time.</p>

      <p>To save a podcast for later, log in using your Google account by using the menu button at the top right. Once logged in you can save podcasts for later using the 'Save Podcast' button.</p>

      <p><span>Please Note:</span> All addresses must be entered like the following: (Street Number) (Street Name) (City) (Province)</p>
      <p>Example: 12 Yonge Street Toronto Ontario</p>
    </header>
  )
}

export default HeaderSection;