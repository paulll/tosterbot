#ifndef GTKWINDOW_H
#define GTKWINDOW_H

#include <iostream>
#include <gtk/gtk.h>
#include <gtkmm.h>

class MainWindow : public Gtk::Window
{

private:
	std::string _buttonLabel;

public:
	MainWindow();
	void set_visual(Glib::RefPtr<Gdk::Visual> visual);
	virtual ~MainWindow();

protected:
	// Signal handlers:
	// Note that on_draw is actually overriding a virtual function
	// from the Gtk::Window class. I set it as virtual here in case
	// someone wants to override it again in a derived class.
	virtual bool on_draw(const ::Cairo::RefPtr< ::Cairo::Context>& cr);
	void on_screen_changed(const Glib::RefPtr<Gdk::Screen>& previous_screen);
	bool upd();

	Gtk::Box _vbox;
	Gtk::Label _label;

	bool _SUPPORTS_ALPHA = false;
};

#endif /* GTKWINDOW_H */