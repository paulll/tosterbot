#include "gtk-window.h"

int main (int argc, char *argv[])
{
	Glib::RefPtr<Gtk::Application> app = Gtk::Application::create(argc, argv, "cc.paulll.tosterbot.spreed");

	MainWindow mainWindow;

	return app->run(mainWindow);
}