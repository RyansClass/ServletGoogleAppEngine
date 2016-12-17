package jp.ryans.factory.codecamp.java.servlet.gae;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

//import jp.ryans.introcat.mail.SendMail;

import com.google.appengine.labs.repackaged.org.json.JSONException;
import com.google.appengine.labs.repackaged.org.json.JSONObject;

@SuppressWarnings("serial")
public class ContactForm extends HttpServlet {

	// ログ出力
		private Logger log = Logger.getLogger(this.getClass().getName());

		private enum Requestor {
			NAME("contact_name"),
			EMAIL("contact_email"),
			MESSAGE("contact_message");
			private String name;
			Requestor (String name) { this.name = name; }
			public String getName() { return this.name; }
		}

		private enum JsonTag {
			STATUS("status"),
			MESSAGE("message"),
			ERRORS("errors"),
			ERROR_PARAMETER("parameter"),
			ERROR_MESSAGE("error_message"),
			RESULTS_SUCCESS("success"),
			RESULTS_ERROR("error");

			private String name;
			JsonTag(String name) {this.name = name;}
			public String getName() {return this.name;}
		}
	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		doPost(req, resp);
	}

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// 変数宣言
		String name = "";
		String email = "";
		String message = "";
		String results ="";
		InternetAddress address = new InternetAddress();
		Map<String, String> error = new HashMap<String, String>();
		try {
        	//レスポンス設定
			resp.setContentType("application/json");
			resp.setCharacterEncoding("UTF-8");
			resp.setHeader("Pragma", "no-cache");
			resp.setHeader("Cache-Control", "no-cache");
			resp.setDateHeader("Expires", 0);
			resp.setHeader("Access-Control-Allow-Origin", "*");

            name = req.getParameter(Requestor.NAME.getName());
    		if ( null == name || "".equals(name)) {
    			error.put(Requestor.NAME.getName(),"お名前を入力してください。");
    		}
    		email = req.getParameter(Requestor.EMAIL.getName());
    		if ( null == email || "".equals(email) ) {
    			error.put(Requestor.EMAIL.getName(),"メールアドレスを入力してください。");
    		} else {
    			address.setAddress( email );
    			try {
    				address.validate();
    			} catch (AddressException e) {
    				// メールアドレスがおかしい
        			error.put(Requestor.EMAIL.getName(),"メールアドレスが正しくありません。");
    			}
    		}
    		message = req.getParameter(Requestor.MESSAGE.getName());
    		if ( null == message || "".equals(message) ) {
    			error.put(Requestor.MESSAGE.getName(),"お問い合わせ内容を入力してください。");
    		}
    		if ( !error.isEmpty() ) {
				error.put(JsonTag.MESSAGE.getName(),"パラメータが正しくありません。");
    			results = setErrorMessage(error);
    		} else {
    			if ( setContactMessage(name,email,message) ) {
    				JSONObject result = new JSONObject();
    				result.put(JsonTag.STATUS.getName(), JsonTag.RESULTS_SUCCESS.getName());
    				result.put(JsonTag.MESSAGE.getName(), "正常に送信できました。");
        			results =  result.toString();
    			} else {
    				error.put(JsonTag.MESSAGE.getName(),"メール送信できませんでした。");
    				results = setErrorMessage(error);
    			}
    		}

    		byte[] b = results.getBytes("UTF-8");
    		resp.setContentLength(b.length);
    		resp.getWriter().println(results);

		} catch (Exception e) {
        	log.severe("異常終了" + e.getMessage());
        	throw new ServletException(e);
        }
        log.info("正常終了");
	}

	private String setErrorMessage(Map<String, String> error) throws JSONException {
		JSONObject result = new JSONObject();
		result.put(JsonTag.STATUS.getName(), JsonTag.RESULTS_ERROR.getName());
		result.put(JsonTag.MESSAGE.getName(), error.get(JsonTag.MESSAGE.getName()));
		JSONObject err = new JSONObject();
		for ( String key : error.keySet() ) {
			if ( ! key.equals(JsonTag.MESSAGE.getName()) ) {
				err.put(key, error.get(key));
			}
		}
		result.put(JsonTag.ERRORS.getName(), err);
		return result.toString();
	}

	private boolean setContactMessage(String name, String email, String message) {
		/*
		// メールメッセージ作成
		SendMail mail = null;
		String subject = "いんとろ猫かふぇ お問い合わせ";
		try {
			mail = new SendMail("contact.txt",false);
			mail.setSubject(subject);
			mail.putFrame("UserName", name);
			mail.putFrame("Content", message);
			mail.setTo(email);
			mail.setBcc("system@ryans.jp");
			mail.send();
		} catch (Exception e) {
			// メール送信エラー
			return false;
		}
		*/
		return true;
	}





}
