import { Metadata } from "next";
import { DOWNLOAD_APK, WEBSITE_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Download ${WEBSITE_NAME} Android App`,
  description: `Download the official ${WEBSITE_NAME} Android app for the best streaming experience on your mobile device.`,
};

export default function AndroidMoviesPage() {
  return (
    <div className="container mx-auto px-4 pt-20 py-8">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Download Android App
        </h1>
        
        <p className="text-muted-foreground text-lg">
          Get the best streaming experience with our official Android application. Watch your favorite movies and TV shows on the go!
        </p>

        <div className="flex justify-center mt-8">
          <Link href={DOWNLOAD_APK} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Download APK
            </Button>
          </Link>
        </div>

        <div className="mt-12 space-y-4 text-sm text-muted-foreground">
          <h2 className="text-xl font-semibold text-foreground">Installation Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-left">
            <li>Download the APK file by clicking the button above</li>
            <li>Enable "Install from Unknown Sources" in your Android settings</li>
            <li>Open the downloaded APK file</li>
            <li>Follow the installation prompts</li>
            <li>Launch the app and enjoy streaming!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}