package com.quebravazo.staff;

import android.annotation.SuppressLint;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ProgressBar;

import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

public class MainActivity extends AppCompatActivity {

    private WebView webView;
    private ProgressBar progressBar;
    private SwipeRefreshLayout swipeRefresh;

    private static final String BASE_URL = "https://que-bravazo.vercel.app";
    private static final String START_URL = BASE_URL + "/login";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        progressBar = findViewById(R.id.progressBar);
        swipeRefresh = findViewById(R.id.swipeRefresh);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true);

        webView.setWebViewClient(new RestrictedWebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                if (newProgress < 100) {
                    progressBar.setVisibility(View.VISIBLE);
                    progressBar.setProgress(newProgress);
                } else {
                    progressBar.setVisibility(View.GONE);
                }
            }
        });

        swipeRefresh.setOnRefreshListener(() -> webView.reload());

        webView.loadUrl(START_URL);
    }

    private class RestrictedWebViewClient extends WebViewClient {

        private static final String[] ALLOWED_PREFIXES = {
            "/login",
            "/admin",
            "/waiter",
            "/chef",
            "/_next",
            "/api",
            "/__nextjs",
            "/favicon",
            "/logo",
        };

        private boolean isAllowed(String url) {
            if (!url.startsWith(BASE_URL) && !url.startsWith("http://localhost") && !url.startsWith("file://")) {
                return false;
            }
            String path = url.replace(BASE_URL, "");
            for (String prefix : ALLOWED_PREFIXES) {
                if (path.startsWith(prefix) || path.equals("/")) {
                    return true;
                }
            }
            return false;
        }

        @Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
            if (isAllowed(url)) {
                view.loadUrl(url);
            } else {
                view.loadUrl(START_URL);
            }
            return true;
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            super.onPageStarted(view, url, favicon);
            if (!isAllowed(url)) {
                view.stopLoading();
                view.loadUrl(START_URL);
            }
        }

        @Override
        public void onPageFinished(WebView view, String url) {
            super.onPageFinished(view, url);
            swipeRefresh.setRefreshing(false);
        }

        @Override
        public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
            if (failingUrl != null) {
                String html = "<html><body style='background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;text-align:center;padding:20px'>"
                    + "<div><h2 style='color:#f59e0b;'>Sin conexión</h2>"
                    + "<p style='color:#a8a29e;font-size:14px;'>Verifica tu conexión a internet e intenta de nuevo.</p>"
                    + "<button onclick='location.reload()' style='background:#f59e0b;color:#000;border:none;padding:12px 32px;border-radius:12px;font-size:16px;font-weight:bold;margin-top:16px;'>Reintentar</button></div></body></html>";
                view.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
            }
            swipeRefresh.setRefreshing(false);
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            finishAffinity();
        }
    }
}
