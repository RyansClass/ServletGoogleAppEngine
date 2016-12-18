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

@SuppressWarnings("serial") // シリアルバージョンIDのワーニング（警告）を防ぐ
public class ContactForm extends HttpServlet {

	// ログ出力
	private Logger log = Logger.getLogger(this.getClass().getName());

	// リクエストのクエリ
	private enum Requestor {
		/* 名前 */
		NAME("contact_name"),
		/* メールアドレス */
		EMAIL("contact_email"),
		/* コメント欄 */
		MESSAGE("contact_message");
		/**
		 * パラメータの名前
		 */
		private String name;

		/**
		 * コンストラクタ
		 * 
		 * @param name
		 */
		Requestor(String name) {
			this.name = name;
		}

		/**
		 * パラメータの名前を取得
		 * 
		 * @return
		 */
		public String getName() {
			return this.name;
		}
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
		InternetAddress address = new InternetAddress();
		Map<String, String> error = new HashMap<String, String>();
		ContactJson json = new ContactJson();
		try {
			// レスポンス設定
			resp.setContentType("application/json");
			resp.setCharacterEncoding("UTF-8");
			resp.setHeader("Pragma", "no-cache");
			resp.setHeader("Cache-Control", "no-cache");
			resp.setDateHeader("Expires", 0);
			resp.setHeader("Access-Control-Allow-Origin", "*");

			name = req.getParameter(Requestor.NAME.getName());
			if (null == name || "".equals(name)) {
				error.put(Requestor.NAME.getName(), "お名前を入力してください。");
			}
			email = req.getParameter(Requestor.EMAIL.getName());
			if (null == email || "".equals(email)) {
				error.put(Requestor.EMAIL.getName(), "メールアドレスを入力してください。");
			} else {
				address.setAddress(email);
				try {
					address.validate();
				} catch (AddressException e) {
					// メールアドレスがおかしい
					error.put(Requestor.EMAIL.getName(), "メールアドレスが正しくありません。");
				}
			}
			message = req.getParameter(Requestor.MESSAGE.getName());
			if (null == message || "".equals(message)) {
				error.put(Requestor.MESSAGE.getName(), "お問い合わせ内容を入力してください。");
			}
			if (!error.isEmpty()) {
				json.setMessage("パラメータが正しくありません。");
				json.setErrorMessage(error);
			} else {
				if (setContactMessage(name, email, message)) {
					json.setSuccess();
					json.setMessage("正常に送信できました。");
				} else {
					json.setMessage("メール送信できませんでした。");
					json.setErrorMessage(error);
				}
			}

			json.writeContent(resp, "UTF-8");

		} catch (Exception e) {
			log.severe("異常終了" + e.getMessage());
			throw new ServletException(e);
		}
		log.info("正常終了");
	}

	private boolean setContactMessage(String name, String email, String message) {

		return true;
	}

}
