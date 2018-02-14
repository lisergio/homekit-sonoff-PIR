#include <PubSubClient.h>
#include <ESP8266WiFi.h>
#include <EEPROM.h>
#include <OneWire.h>
#include <ESP8266WebServer.h>
#include <DNSServer.h>
#include <WiFiManager.h>  

IPAddress server(192, 168, 0, 56); // IP de la raspberry Pi
const char* host = "Sonoff1estadoPIR"; // nombre del entorno

int rele = 12;
int led = 13;
int pulsador = 0;
boolean estado_pulsador ;
boolean estado_luz = 0;
int temporizador=0;
float temp;
int pir = 14;
boolean estado_pir=0;
int alarmON=1;
int alarmOFF=0;
int ssid_length;
int passw_length;
String ssid; 
String passw;
const char* ssid2;
const char* passw2;
boolean estadoAnterior=0;
boolean estadoActual;


#define BUFFER_SIZE 100

WiFiClient wclient;
PubSubClient client(wclient, server);

void callback(const MQTT::Publish& pub) {
  Serial.println (pub.payload_string());
    if(pub.payload_string() == "on")
    {
      digitalWrite(rele, HIGH); // en caso de que el modulo rele funcione al reves, cambiarl LOW por HIGH
      digitalWrite(led, LOW);
      estado_luz=1;
      Serial.println("Switch On");         
    }
    if(pub.payload_string() == "off")
    {
      digitalWrite(rele, LOW); // en caso de que el modulo rele funcione al reves, cambiarl HIGH por LOW
      digitalWrite(led, HIGH);
      estado_luz=0;
      Serial.println("Switch Off");
    }

    if (estado_luz != EEPROM.read(0)) EEPROM.write(0,estado_luz);
    EEPROM.commit();
}

void setup() 
{
  pinMode(rele,OUTPUT);
  pinMode(led,OUTPUT);
  pinMode(pulsador,INPUT);
  pinMode(14,INPUT);
  delay(1000);
  digitalWrite(led, LOW);
  Serial.begin(115200);
  EEPROM.begin(512);
  delay(10);
  Serial.println();
  Serial.println();
  client.set_callback(callback);


    if (WiFi.status() != WL_CONNECTED) {
    Serial.print("Connecting to ");
    Serial.print(WiFi.SSID());
    Serial.println("...");
    WiFi.mode(WIFI_STA);
    WiFi.begin();
    if (WiFi.waitForConnectResult() != WL_CONNECTED){
      Serial.println("WiFi not connected");
      WiFiManager wifiManager;  
      if (!wifiManager.startConfigPortal("Sonoff-PIR")) { // SSID 
        Serial.println("failed to connect and hit timeout");
        delay(3000);
        ESP.reset();
        delay(5000);
        }
      Serial.print("connected to ");
      Serial.println(WiFi.SSID());
      EEPROM.commit();
      delay(2000);
    }
    else
   {
     Serial.println("WiFi connected");                       
   }
  }   
  estado_luz=EEPROM.read(0);
  digitalWrite(rele,EEPROM.read(0));
  digitalWrite(led,!EEPROM.read(0));
  delay(200);
}

void loop() {
  comprobar_PIR(); 
  estado_pulsador=digitalRead(pulsador);
  if (estado_pulsador==LOW)
  {
    if (estado_luz==0)
    {
      estado_luz=1;
      client.publish("Sonoff1estadoPIR","SwitchedOn");
      Serial.println("Switch On");
      digitalWrite(rele,HIGH);  // en caso de que el modulo rele funcione al reves, cambiarl HIGH por LOW
      digitalWrite(led, LOW);     
    }
    else
    {
      estado_luz=0; 
      client.publish("Sonoff1estadoPIR","SwitchedOff");
      Serial.println("Switch Off");
      digitalWrite(rele,LOW); // en caso de que el modulo rele funcione al reves, cambiarl LOW por HIGH
      digitalWrite(led, HIGH);          
    }

    delay(1000);
    EEPROM.write(0,estado_luz);    
  }


    if (WiFi.status() == WL_CONNECTED) {

      if (client.connected())
      {
 
      }

 
    if (!client.connected()) {
      if (client.connect("ESP8266: Sonoff1estadoPIR")) {
        client.publish("outTopic",(String)"hello world, I'm "+host);
        client.subscribe(host+(String)"/#");
      }
    }
    if (client.connected())
      {
      }
      client.loop();
  }

delay(50);
}

void comprobar_PIR()
{
  estadoActual = digitalRead(pir);
  estado_pir = digitalRead(pir);

  if (estadoAnterior != estadoActual) 
  {
    if (estado_pir == HIGH)
    {
      Serial.println(String(alarmON))  ;
      client.publish("Sonoff1Movimiento",String(alarmON));
    }
    if (estado_pir == LOW)
    {
      Serial.println(String(alarmOFF))  ;
      client.publish("Sonoff1Movimiento",String(alarmOFF));
    } 
    estadoAnterior = estadoActual;      
  }
  delay(50);
}

