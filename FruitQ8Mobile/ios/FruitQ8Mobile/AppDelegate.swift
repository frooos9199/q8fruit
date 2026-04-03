import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import FirebaseCore

@main
class AppDelegate: RCTAppDelegate {
  override func bundleURL() -> URL? {
    #if DEBUG
    return RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
    #else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
    #endif
  }
  
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    self.moduleName = "FruitQ8Mobile"
    self.dependencyProvider = RCTAppDependencyProvider()
    self.initialProps = [:]

    if FirebaseApp.app() == nil {
      FirebaseApp.configure()
    }
    
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
}
