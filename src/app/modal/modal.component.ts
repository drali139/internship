import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ModalController, ActionSheetController } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Camera, CameraResultType, Photo, GalleryPhoto } from '@capacitor/camera';
import { Share } from '@capacitor/share';
import jsPDF from 'jspdf';

interface ImageItem {
  filePath: string;
  displayPath: string;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  selectedImages = signal<ImageItem[]>([]);
  description: string = '';

  constructor(
    private modalCtrl: ModalController,
    private actionSheetCtrl: ActionSheetController
  ) {}

  async dismissModal() {
    await this.modalCtrl.dismiss();
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Select Image Source',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera',
          handler: () => this.takePicture()
        },
        {
          text: 'Choose from Gallery',
          icon: 'image',
          handler: () => this.pickImages()
        },
        {
          text: 'Cancel',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePicture() {
    try {
      const image: Photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });

      const savedImage = {
        filePath: image.path ?? '',
        displayPath: image.webPath ?? '',
      };
      
      console.log('Image Taken:', savedImage);
      this.selectedImages.update(images => [...images, savedImage]);
    } catch (error) {
      console.error('Error taking photo:', error);
    }
  }

  async pickImages() {
    try {
      const result = await Camera.pickImages({
        quality: 90,
        limit: 10
      });

      const newImages = result.photos.map((photo: GalleryPhoto) => ({
        filePath: photo.path ?? '',
        displayPath: photo.webPath ?? ''
      }));

      console.log('Images Picked:', newImages);
      this.selectedImages.update(images => [...images, ...newImages]);
    } catch (error) {
      console.error('Error picking images:', error);
    }
  }

  removeImage(index: number) {
    this.selectedImages.update(images => 
      images.filter((_, i) => i !== index)
    );
  }

  async generateAndSharePDF() {
    try {
      const pdf = new jsPDF();
      const images = this.selectedImages();
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
  
      
      for (let i = 0; i < images.length; i++) {
        const img = images[i].displayPath;
  
        const imgElement = new Image();
        imgElement.src = img;
        await new Promise((resolve) => (imgElement.onload = resolve));
  
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        const maxWidth = 800;
        const scale = maxWidth / imgElement.width;
  
        const width = Math.min(imgElement.width, maxWidth);
        const height = imgElement.height * scale;
  
        canvas.width = width;
        canvas.height = height;
        context.drawImage(imgElement, 0, 0, width, height);
  
        const resizedImage = canvas.toDataURL('image/jpeg', 0.7);
  
        if (i > 0) {
          pdf.addPage();
        }
        const imgProps = pdf.getImageProperties(resizedImage);
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(resizedImage, 'JPEG', 10, 10, pdfWidth, pdfHeight);
      }
  
      
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('Description:', 10, 20);
      pdf.setFontSize(12);
      pdf.text(this.description, 10, 30, { maxWidth: pdfWidth });
  
      
      const fileName = 'shared_images';
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `${fileName}.pdf`, { type: 'application/pdf' });
  
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Shared PDF',
          text: 'Here is your shared PDF.',
        });
      } else {
        console.error('Web Share API not supported.');
      }
    } catch (error) {
      console.error('Error generating and sharing PDF:', error);
    }
  } 
}
