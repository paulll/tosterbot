/**
 * MainWindow.cpp
 *
 * Code adapted from 'alphademo.c' by Mike
 * (http://plan99.net/~mike/blog--now a dead link--unable to find it.)
 * as modified by karlphillip for StackExchange:
 *     (http://stackoverflow.com/questions/3908565/how-to-make-gtk-window-background-MainWindow)
 * Re-worked for Gtkmm 3.0 by Louis Melahn, L.C. January 31, 2014.
 * modified by paulll (https://github.com/paulll/tosterbot/blob/master/modules/lib/spreed/src/gtk-window.cc)
 */
#include "gtk-window.h"

MainWindow::MainWindow()
{

	// Получаем параметры текущего монитора.
	Glib::RefPtr<Gdk::Screen> screen = get_screen();
	const int monitor = screen->get_primary_monitor();
	Gdk::Rectangle size = screen->get_monitor_workarea(monitor);


	// Параметры окна (имя, размер, положение)
	set_title("Tosterbot");
	set_decorated(false);
	set_can_focus(false);
	set_app_paintable(true);
	set_skip_taskbar_hint();
	set_skip_pager_hint();
	set_accept_focus(false);
	set_type_hint(Gdk::WINDOW_TYPE_HINT_DOCK);
	set_default_size(size.get_width(), 150);
	set_position(Gtk::WIN_POS_NONE);
	move(size.get_x(), size.get_y() + size.get_height() - 150);


	// Обработка для прозрачного фона
	signal_draw().connect(sigc::mem_fun(*this, &MainWindow::on_draw));
	signal_screen_changed().connect(sigc::mem_fun(*this, &MainWindow::on_screen_changed));
	on_screen_changed(get_screen());

	// Выравнивалка
	add(_vbox);
	_vbox.add(_label);

	// Полный размер нужен для выравнивания текста
	_label.set_hexpand(true);
	_label.set_vexpand(true);

	// Позволяет использовать разметку для оформления текста
	_label.set_use_markup();

	// Обновление текста
	sigc::slot<bool>my_slot = sigc::mem_fun(*this, &MainWindow::upd);
	Glib::signal_timeout().connect(my_slot, 30);

	// По-умолчанию элементы невидимы.
	show_all();
}

/**
 * Проверяет, доступен ли stdin для чтения.
 * Нужно для того, чтобы избежать блокировки.
 * Не должно работать на винде, я полагаю. Хотя хз.
 */
bool inputAvailable()  
{
	struct timeval tv;
	fd_set fds;
	tv.tv_sec = 0;
	tv.tv_usec = 0;
	FD_ZERO(&fds);
	FD_SET(STDIN_FILENO, &fds);
	select(STDIN_FILENO+1, &fds, NULL, NULL, &tv);
	return (FD_ISSET(0, &fds));
}

/**
 * Вызывается раз в 30мс, и рисует строку,
 * если она поступила в stdin
 */
bool MainWindow::upd() {
	std::string line;
	Glib::ustring text;
	if (inputAvailable()) {
		if (getline(std::cin, line)) {
			text = Glib::ustring(line);
			_label.set_label(text);
		} else {
			return false;
		}
	} else {
		return true;
	}
	
	return true;
}

MainWindow::~MainWindow()
{
}

/**
 * Рисует фон
 */
bool MainWindow::on_draw(const Cairo::RefPtr<Cairo::Context>& cr)
{
	cr->save();
	if (_SUPPORTS_ALPHA) {
		cr->set_source_rgba(0, 0, 0, 0);
	} else {
		cr->set_source_rgb(0, 0, 0);
	}
	cr->set_operator(Cairo::OPERATOR_SOURCE);
	cr->paint();
	cr->restore();

	return Gtk::Window::on_draw(cr);
}

/**
 * Проверка, поддерживает ли экран альфа-канал
 */
void MainWindow::on_screen_changed(const Glib::RefPtr<Gdk::Screen>& previous_screen) {
	auto screen = get_screen();
	auto visual = screen->get_rgba_visual();

	if (!visual) {
		std::cout << "Your screen does not support alpha channels!" << std::endl;
	} else {
		_SUPPORTS_ALPHA = TRUE;
	}

	set_visual(visual);
}

/**
 * Видимо отсутствует в Gtkmm, так что тут реализация из чистого Gtk
 */
void MainWindow::set_visual(Glib::RefPtr<Gdk::Visual> visual) {
	gtk_widget_set_visual(GTK_WIDGET(gobj()), visual->gobj());
}