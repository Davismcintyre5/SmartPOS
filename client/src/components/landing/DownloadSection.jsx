// DownloadSection
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Monitor, Smartphone } from "lucide-react";
import { landingApi } from "../../api/landingApi";

export const DownloadSection = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    landingApi.getDownloads().then((res) => {
      if (res.success) setData(res.downloads);
    });
  }, []);

  if (!data || (!data.mobileAppEnabled && !data.desktopAppEnabled)) return null;

  return (
    <section id="downloads" className="py-16 px-4 bg-gray-50 dark:bg-gray-900 scroll-mt-20 text-center">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Download SmartPOS</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Get the app for your device.</p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        {data.mobileAppEnabled && data.mobileAppUrl && <a href={data.mobileAppUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="lg"><Smartphone className="w-5 h-5" /> Mobile App</Button></a>}
        {data.desktopAppEnabled && data.desktopAppUrl && <a href={data.desktopAppUrl} target="_blank" rel="noopener noreferrer"><Button size="lg"><Monitor className="w-5 h-5" /> Desktop App</Button></a>}
      </div>
    </section>
  );
};