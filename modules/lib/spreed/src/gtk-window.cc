/**
 * MainWindow.cpp
 *
 * Code adapted from 'alphademo.c' by Mike
 * (http://plan99.net/~mike/blog--now a dead link--unable to find it.)
 * as modified by karlphillip for StackExchange:
 *     (http://stackoverflow.com/questions/3908565/how-to-make-gtk-window-background-MainWindow)
 * Re-worked for Gtkmm 3.0 by Louis Melahn, L.C. January 31, 2014.
 */
#include "gtk-window.h"

MainWindow::MainWindow()
{

	Glib::RefPtr<Gdk::Screen> screen = get_screen();
	const int monitor = screen->get_primary_monitor();
	Gdk::Rectangle size = screen->get_monitor_workarea(monitor);



	// Set up the top-level window.
	set_title("Tosterbot");
	//set_default_size(400,200);
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


	// Signal handlers
	signal_draw().connect(sigc::mem_fun(*this, &MainWindow::on_draw));
	signal_screen_changed().connect(sigc::mem_fun(*this, &MainWindow::on_screen_changed));

	// Widgets
	on_screen_changed(get_screen());
	add(_vbox);

	Glib::ustring text = "<span foreground=\"black\" background=\"white\">t<span foreground=\"red\">o</span>ster</span>";

	_label.set_use_markup();
	_label.set_label(text);

	_label.set_hexpand(true);
	_label.set_vexpand(true);

	// Now pack the button into the aligner.
	_vbox.add(_label);


	sigc::slot<bool>my_slot = sigc::mem_fun(*this, &MainWindow::upd);
	Glib::signal_timeout().connect(my_slot, 30);

	// Show the window and all its children.
	show_all();

	/*/
	std::string line;
	while (getline(std::cin, line)) {
		text = Glib::ustring(line);
		std::cout << "Hmm: " << text << std::endl;
		_label.set_label(text);
	}
	//*/
}

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

bool MainWindow::upd() {
	std::string line;
	Glib::ustring text;
	if (inputAvailable()) {
		if (getline(std::cin, line)) {
			text = Glib::ustring(line);
			//std::cout << "hey: " << text << std::endl;
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

bool MainWindow::on_draw(const Cairo::RefPtr<Cairo::Context>& cr)
{
	cr->save();
	if (_SUPPORTS_ALPHA) {
		cr->set_source_rgba(0, 0, 0, 0);    // MainWindow
	} else {
		cr->set_source_rgb(0, 0, 0);          // opaque
	}
	cr->set_operator(Cairo::OPERATOR_SOURCE);
	cr->paint();
	cr->restore();

	return Gtk::Window::on_draw(cr);
}

/**
 * Checks to see if the display supports alpha channels
 */
void MainWindow::on_screen_changed(const Glib::RefPtr<Gdk::Screen>& previous_screen) {
	auto screen = get_screen();
	auto visual = screen->get_rgba_visual();

	if (!visual) {
		std::cout << "Your screen does not support alpha channels!" << std::endl;
	} else {
		//std::cout << "Your screen supports alpha channels!" << std::endl;
		_SUPPORTS_ALPHA = TRUE;
	}

	set_visual(visual);
}

/**
 * This simply adds a method which seems to be missing in Gtk::Widget,
 * so I had to use Gtk+ manually.
 *
 * Sets the visual for 'this' (the current widget).
 */
void MainWindow::set_visual(Glib::RefPtr<Gdk::Visual> visual) {
	gtk_widget_set_visual(GTK_WIDGET(gobj()), visual->gobj());
}

/**
 * If I click somewhere other than the button, this toggles
 * between having window decorations and not having them.
 */
bool MainWindow::on_window_clicked(GdkEventButton* event) {
	set_decorated(!get_decorated());
	return false;
}