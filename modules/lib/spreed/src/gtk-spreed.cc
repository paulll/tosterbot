#include <iostream>
#include <gtkmm.h>
#include <gtk/gtk.h>
#include <gtkmm/application.h>
#include "gtk-window.h"

int main (int argc, char *argv[])
{
	Glib::RefPtr<Gtk::Application> app = Gtk::Application::create(argc, argv, "cc.paulll.tosterbot.notify1");

	MainWindow mainWindow;

	return app->run(mainWindow);
}


int zmain(int argc, char *argv[]) {
	Glib::RefPtr<Gtk::Application> app = Gtk::Application::create(argc, argv, "cc.paulll.tosterbot.notify1");

	Gtk::Window window;
	Gtk::Label label;

	Gtk::Box *vbox = Gtk::manage(new Gtk::Box(Gtk::ORIENTATION_VERTICAL, 0));
	
	window.add(*vbox);

	Glib::ustring text = "FF<span foreground=\"black\" background=\"white\">t<span foreground=\"red\">o</span>ster</span>";

	label.set_use_markup();
	label.set_label(text);

	label.set_hexpand(true);
	label.set_vexpand(true);
	label.set_visible(true);

	vbox->set_visible(true);
	vbox->add(label);

	window.set_default_size(200, 200);
	window.set_border_width(0);
	window.set_decorated(false);
	window.set_app_paintable(true);

	//window.signal_draw().connect(sigc::mem_fun(*this, &Transparent::on_draw));

	return app->run(window);
}